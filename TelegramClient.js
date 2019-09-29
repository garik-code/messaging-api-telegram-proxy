"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;

var httpsProxyAgent = require('https-proxy-agent');
var _axiosError = _interopRequireDefault(require("axios-error"));
var _axios = _interopRequireDefault(require("axios"));
var _debug = _interopRequireDefault(require("debug"));
var _lodash = _interopRequireDefault(require("lodash.omit"));
var _urlJoin = _interopRequireDefault(require("url-join"));
function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);
if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(source, true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(source).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}

const debugRequest = (0, _debug.default)('messaging-api-telegram');

function onRequest({ method, url, body }) {
  debugRequest(`${method} ${url}`);
  if (body) {
    debugRequest('Outgoing request body:');
    debugRequest(JSON.stringify(body, null, 2));
  }
}

class TelegramClient {
  static connect(accessTokenOrConfig, proxy) {
    return new TelegramClient(accessTokenOrConfig, proxy);
  }







  constructor(accessTokenOrConfig, proxy) {
    _defineProperty(this, "_token", void 0);
    _defineProperty(this, "_proxy", void 0);
    _defineProperty(this, "_onRequest", void 0);
    _defineProperty(this, "_axios", void 0);
    let origin;
    if (accessTokenOrConfig && typeof accessTokenOrConfig === 'object') {
      const config = accessTokenOrConfig;
      this._token = config.accessToken;
      this._proxy = proxy
      this._onRequest = config.onRequest || onRequest;
      origin = config.origin;
    } else {
      this._token = accessTokenOrConfig;
      this._proxy = proxy
      this._onRequest = onRequest;
    }

    let agent = new httpsProxyAgent(this._proxy)

    this._axios = _axios.default.create({
      baseURL: `${origin || 'https://api.telegram.org'}/bot${this._token}/`,
      headers: {
        'Content-Type': 'application/json'
      },
      httpsAgent: agent
    });



    this._axios.interceptors.request.use(config => {
      this._onRequest({
        method: config.method,
        url: (0, _urlJoin.default)(config.baseURL, config.url),
        headers: _objectSpread({},
        config.headers.common, {},
        config.headers[config.method], {},
        (0, _lodash.default)(config.headers, [
        'common',
        'get',
        'post',
        'put',
        'patch',
        'delete',
        'head'])),


        body: config.data });

      return config;
    });
  }

  get axios() {
    return this._axios;
  }

  get accessToken() {
    return this._token;
  }

  async _request(...args) {
    try {

      const response = await this._axios.post(...args);

      const { data, config, request } = response;

      if (!data.ok) {
        throw new _axiosError.default(`Telegram API - ${data.description || ''}`, {
          config,
          request,
          response });

      }

      return data.result;
    } catch (err) {
      if (err.response && err.response.data) {
        const { error_code, description } = err.response.data;
        const msg = `Telegram API - ${error_code} ${description || ''}`; // eslint-disable-line camelcase

        throw new _axiosError.default(msg, err);
      }
      throw new _axiosError.default(err.message, err);
    }
  }

  /**
     * https://core.telegram.org/bots/api#getupdates
     */
  getUpdates(options) {
    return this._request('/getUpdates', _objectSpread({},
    options));

  }

  /**
     * https://core.telegram.org/bots/api#getwebhookinfo
     */
  getWebhookInfo() {
    return this._request('/getWebhookInfo');
  }

  /**
     * https://core.telegram.org/bots/api#setwebhook
     */
  setWebhook(url) {
    return this._request('/setWebhook', {
      url });

  }

  /**
     * https://core.telegram.org/bots/api#deletewebhook
     */
  deleteWebhook() {
    return this._request('/deleteWebhook');
  }

  /**
     * https://core.telegram.org/bots/api#getme
     */
  getMe() {
    return this._request('/getMe');
  }

  /**
     * https://core.telegram.org/bots/api#getuserprofilephotos
     */
  getUserProfilePhotos(userId, options) {
    return this._request('/getUserProfilePhotos', _objectSpread({
      user_id: userId },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#getfile
     */
  getFile(fileId) {
    return this._request('/getFile', {
      file_id: fileId });

  }

  /**
     * Get link for file. This is extension method of getFile()
     */
  getFileLink(fileId) {
    return this.getFile(fileId).then(
    (result) =>
    `https://api.telegram.org/file/bot${this._token}/${result.file_path}`);

  }

  /**
     * https://core.telegram.org/bots/api#getchat
     */
  getChat(chatId) {
    return this._request('/getChat', {
      chat_id: chatId });

  }

  /**
     * https://core.telegram.org/bots/api#getchatmemberscount
     */
  getChatAdministrators(chatId) {
    return this._request('/getChatAdministrators', {
      chat_id: chatId });

  }

  /**
     * https://core.telegram.org/bots/api#getchatmemberscount
     */
  getChatMembersCount(chatId) {
    return this._request('/getChatMembersCount', {
      chat_id: chatId });

  }

  /**
     * https://core.telegram.org/bots/api#getchatmemberscount
     */
  getChatMember(chatId, userId) {
    return this._request('/getChatMember', {
      chat_id: chatId,
      user_id: userId });

  }

  /**
     * https://core.telegram.org/bots/api#sendmessage
     */
  sendMessage(chatId, text, options) {
    return this._request('/sendMessage', _objectSpread({
      chat_id: chatId,
      text },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#sendphoto
     */
  sendPhoto(chatId, photo, options) {
    return this._request('/sendPhoto', _objectSpread({
      chat_id: chatId,
      photo },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#sendaudio
     */
  sendAudio(chatId, audio, options) {
    return this._request('/sendAudio', _objectSpread({
      chat_id: chatId,
      audio },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#senddocument
     */
  sendDocument(chatId, document, options) {
    return this._request('/sendDocument', _objectSpread({
      chat_id: chatId,
      document },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#sendsticker
     */
  sendSticker(chatId, sticker, options) {
    return this._request('/sendSticker', _objectSpread({
      chat_id: chatId,
      sticker },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#sendvideo
     */
  sendVideo(chatId, video, options) {
    return this._request('/sendVideo', _objectSpread({
      chat_id: chatId,
      video },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#sendvoice
     */
  sendVoice(chatId, voice, options) {
    return this._request('/sendVoice', _objectSpread({
      chat_id: chatId,
      voice },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#sendvideonote
     */
  sendVideoNote(chatId, videoNote, options) {
    return this._request('/sendVideoNote', _objectSpread({
      chat_id: chatId,
      video_note: videoNote },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#sendmediagroup
     */
  sendMediaGroup(chatId, media, options) {
    return this._request('/sendMediaGroup', _objectSpread({
      chat_id: chatId,
      media },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#sendlocation
     */
  sendLocation(
  chatId,
  { latitude, longitude },
  options)
  {
    return this._request('/sendLocation', _objectSpread({
      chat_id: chatId,
      latitude,
      longitude },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#editmessagelivelocation
     */
  editMessageLiveLocation(
  { latitude, longitude },
  options)
  {
    return this._request('/editMessageLiveLocation', _objectSpread({
      latitude,
      longitude },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#stopmessagelivelocation
     */
  stopMessageLiveLocation(identifier) {
    return this._request('/stopMessageLiveLocation', _objectSpread({},
    identifier));

  }

  /**
     * https://core.telegram.org/bots/api#sendvenue
     */
  sendVenue(
  chatId,
  {
    latitude,
    longitude,
    title,
    address },






  options)
  {
    return this._request('/sendVenue', _objectSpread({
      chat_id: chatId,
      latitude,
      longitude,
      title,
      address },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#sendcontact
     */
  sendContact(
  chatId,
  {
    phone_number,
    first_name },

  options)
  {
    return this._request('/sendContact', _objectSpread({
      chat_id: chatId,
      phone_number,
      first_name },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#sendchataction
     */
  sendChatAction(chatId, action) {
    return this._request('/sendChatAction', {
      chat_id: chatId,
      action });

  }

  /**
     * https://core.telegram.org/bots/api#editmessagetext
     */
  editMessageText(text, options) {
    return this._request('/editMessageText', _objectSpread({
      text },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#editmessagecaption
     */
  editMessageCaption(caption, options) {
    return this._request('/editMessageCaption', _objectSpread({
      caption },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#editmessagereplymarkup
     */
  editMessageReplyMarkup(replyMarkup, options) {
    return this._request('/editMessageReplyMarkup', _objectSpread({
      reply_markup: replyMarkup },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#deletemessage
     */
  deleteMessage(chatId, messageId) {
    return this._request('/deleteMessage', {
      chat_id: chatId,
      message_id: messageId });

  }

  /**
     * https://core.telegram.org/bots/api#kickchatmember
     */
  kickChatMember(chatId, userId, options) {
    return this._request('/kickChatMember', _objectSpread({
      chat_id: chatId,
      user_id: userId },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#unbanChatMember
     */
  unbanChatMember(chatId, userId) {
    return this._request('/unbanChatMember', {
      chat_id: chatId,
      user_id: userId });

  }

  /**
     * https://core.telegram.org/bots/api#restrictChatMember
     */
  restrictChatMember(chatId, userId, options) {
    return this._request('/restrictChatMember', _objectSpread({
      chat_id: chatId,
      user_id: userId },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#promoteChatMember
     */
  promoteChatMember(chatId, userId, options) {
    return this._request('/promoteChatMember', _objectSpread({
      chat_id: chatId,
      user_id: userId },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#exportChatInviteLink
     */
  exportChatInviteLink(chatId) {
    return this._request('/exportChatInviteLink', {
      chat_id: chatId });

  }

  /**
     * https://core.telegram.org/bots/api#setChatPhoto
     */
  setChatPhoto(chatId, photo) {
    return this._request('/setChatPhoto', {
      chat_id: chatId,
      photo });

  }

  /**
     * https://core.telegram.org/bots/api#deleteChatPhoto
     */
  deleteChatPhoto(chatId) {
    return this._request('/deleteChatPhoto', {
      chat_id: chatId });

  }

  /**
     * https://core.telegram.org/bots/api#setChatTitle
     */
  setChatTitle(chatId, title) {
    return this._request('/setChatTitle', {
      chat_id: chatId,
      title });

  }

  /**
     * https://core.telegram.org/bots/api#setChatDescription
     */
  setChatDescription(chatId, description) {
    return this._request('/setChatDescription', {
      chat_id: chatId,
      description });

  }

  /**
     * https://core.telegram.org/bots/api#setchatstickerset
     */
  setChatStickerSet(chatId, stickerSetName) {
    return this._request('/setChatStickerSet', {
      chat_id: chatId,
      sticker_set_name: stickerSetName });

  }

  /**
     * https://core.telegram.org/bots/api#deletechatstickerset
     */
  deleteChatStickerSet(chatId) {
    return this._request('/deleteChatStickerSet', {
      chat_id: chatId });

  }

  /**
     * https://core.telegram.org/bots/api#pinChatMessage
     */
  pinChatMessage(chatId, messageId, options) {
    return this._request('/pinChatMessage', _objectSpread({
      chat_id: chatId,
      messsage_id: messageId },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#unpinChatMessage
     */
  unpinChatMessage(chatId) {
    return this._request('/unpinChatMessage', {
      chat_id: chatId });

  }

  /**
     * https://core.telegram.org/bots/api#leaveChat
     */
  leaveChat(chatId) {
    return this._request('/leaveChat', {
      chat_id: chatId });

  }

  /**
     * https://core.telegram.org/bots/api#getchatmemberscount
     */
  forwardMessage(
  chatId,
  fromChatId,
  messageId,
  options)
  {
    return this._request('/forwardMessage', _objectSpread({
      chat_id: chatId,
      from_chat_id: fromChatId,
      message_id: messageId },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#sendinvoice
     */
  sendInvoice(
  chatId,
  product,








  options)
  {
    return this._request('/sendInvoice', _objectSpread({
      chat_id: chatId },
    product, {},
    options));

  }

  /**
     * https://core.telegram.org/bots/api#answershippingquery
     */
  answerShippingQuery(shippingQueryId, ok, options) {
    return this._request('/answerShippingQuery', _objectSpread({
      shipping_query_id: shippingQueryId,
      ok },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#answerprecheckoutquery
     */
  answerPreCheckoutQuery(
  preCheckoutQueryId,
  ok,
  options)
  {
    return this._request('/answerPreCheckoutQuery', _objectSpread({
      pre_checkout_query_id: preCheckoutQueryId,
      ok },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#answerinlinequery
     */
  answerInlineQuery(
  inlineQueryId,
  results,
  options)
  {
    return this._request('/answerInlineQuery', _objectSpread({
      inline_query_id: inlineQueryId,
      results },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#sendgame
     */
  sendGame(chatId, gameShortName, options) {
    return this._request('/sendGame', _objectSpread({
      chat_id: chatId,
      game_short_name: gameShortName },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#setgamescore
     */
  setGameScore(userId, score, options) {
    return this._request('/setGameScore', _objectSpread({
      user_id: userId,
      score },
    options));

  }

  /**
     * https://core.telegram.org/bots/api#getgamehighscores
     */
  getGameHighScores(userId, options) {
    return this._request('/getGameHighScores', _objectSpread({
      user_id: userId },
    options));

  }}exports.default = TelegramClient;
