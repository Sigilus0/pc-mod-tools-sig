// ==UserScript==
// @name             YouTube Chat Regex Mod Actions
// @description      Automatically hide messages based on regex
// @author           somestufforsomething
// @updateURL        https://github.com/somestufforsomething/pc-mod-tools/raw/main/YouTube%20Chat%20Regex%20Mod%20Actions.user.js
// @downloadURL      https://github.com/somestufforsomething/pc-mod-tools/raw/main/YouTube%20Chat%20Regex%20Mod%20Actions.user.js
// @supportURL       https://github.com/somestufforsomething/pc-mod-tools/issues
// @license          MIT
// @match            https://*.youtube.com/*
// @version          20221015.1
// ==/UserScript==

// ======================== Settings ============================
// Log all messages to the console (for debugging)
const SHOWALL = false;

// Specify patterns to automatically hide/ban a user from yt chat
// Name filters
const name_filter = [
    /\.\s*(com|fyi|life|ngo|nko|ong|pro|red|rent|tech|today|uno|wtf|xyz)\b/i,
    /69mega\s*\.\s*fun/i,
    /bestcams\s*\.\s*fun/i,
    /bitcoin-in\s*\.\s*xyz/i,
    /bit-invest\s*\.\s*xyz/i,
    /casino-top1\s*\.\s*com/i,
    /likesex\s*\.\s*uno/i,
    /loveface\s*\.\s*xyz/i,
    /love-chat1?\s*\.\s*xyz/i,
    /(naked|nude)-(game|hd|sex)\s*\.\s*(fun|xyz)/i,
    /sexfind\s*\.\s*pro/i,
    /sexfind4\s*\.\s*com/i,
    /sexy-chat\s*\.\s*xyz/i,
    /tinder-x\s*\.\s*xyz/i,
    /tinder-hot\s*\.\s*xyz/i,
    /webcam-cam\s*\.\s*xyz/i,
    /webcams-chat\s*\.\s*(com|xyz)/i,
    /xxgirls\s*\.\s*uno/i,
    /n(i|l)g{2}er/i,
    /richard ?simmons/i,
    /DumbDrum 1999 \(Dahir Behi\)/i,
    /thomas.*rillo/i,
    /earn money on the crypt!/i,
    /adu(i|l)t dat(i|l)ng s(i|l)te/i,
    /hot (boys|girls) and (boys|girls) (18\+ )?video chat/i,
    /best adult dating site!/i,
    /84% have already found love with us/i,
    /bro! cheapest tinder just for sex!/i,
    /bro! just go website and fuck girl/i,
    /cheap sex dating! just fuck girls!/i,
    /cheap sex! streamer recommends!/i,
    /cheaper tinder! even you can fuck!/i,
    /cheapest sex dating! find n fuck!/i,
    /enough watch stream! girls here!/i,
    /free girls from your city/i,
    /fill life with emotions - find love/i,
    /find girl even in the shithole!/i,
    /find love in your city today!/i,
    /fuck ad! wet girls are here! bro!/i,
    /fuck tinder! we are cheaper & fast/i,
    /future is here! dating ai match 84%/i,
    /have a good time - find love!/i,
    /here girls want everyone even you/i,
    /jerk off adv! wet girls are here!/i,
    /just try this cheapest sex tinder!/i,
    /looks like we found a girl for you!/i,
    /looks like we found you a girl!/i,
    /love to cheap fuck? then we're in!/i,
    /new ai dating disrupt an industry!​/i,
    /new ai will find a girl for you/i,
    /no whores! real cheap fuck dates!/i,
    /omg! fuck ad! sex cheaper tinder!/i,
    /only putin didn't find girl with us/i,
    /our ai help you find perfect match!/i,
    /send dick pics to girls with us/i,
    /sex dates! fuck overpriced tinder/i,
    /stop jerking! find girl and fuck!/i,
    /stop watching the stream! find love/i,
    /the cheapest one time 18\+ dates!/i,
    /tinder overpriced shit! try us 18\+/i,
    /tired of being alone\? we'll help u/i,
    /ugh tinder? our girls write first!/i,
    /very cool anime adult game/i,
    /want to find help\? we will help!/i,
    /want to find love\? our ai will help!/i,
    /we have more cheap sex than tinder/i,
    /airbnb sexy super host 69/i,
    /dog butt licking services/i,
    /sex penetration pussy/i,
    /i love kids? p(o|0)rn/i,
    /my b(i|l)g d(i|l)ck in your m(o|0)uth/i,
    /humbert the hummer/i,
    /h(a|e)il hitler/i
];

// Message filters
const msg_filter = [
    /niosnc\s*\.\s*site/i,
    /sister19lol\s*\.\s*online/i,
    /your-dreams\s*\.\s*online/i,
    /v.{2,3}\s*\(?\s*\.\s*\)?\s*(fyi|life|ngo|nko|ong|red|rent|tech|today|wtf)/i,
    /i will eliminate the middle class/i,
    /i love kids\s*:yt:/i,
    /:yt:\s*i love kids/i,
    /this bot is inmortal and unbannable thx to our patrons/i,
    /nymphet/i,
    /n(i|l)g{2}er/i
];

const del_filter = [
];

// TODO: add which action {del, time, hide} to perform:
//      { pat: <pat>, act: <act> }
// const remove_msg = "Remove";
// const timeout_user = "Put user in timeout";
// const hide_user = "Hide user on this channel";
// ==============================================================
(async function () {
    const root = await getRootNode(window.location.href);
    if (!root) { return; }

    // mod check
    if (!root.querySelector('yt-live-chat-message-input-renderer #author-name')
        .className.match(/\b(owner|moderator)\b/)) {
        return;
    }

    // switch to Live view
    switchToLiveView(root);

    let count = 0;
    console.log("Ready to bonk!");
    new MutationObserver((mutationsList) => {
        mutationsList.forEach(function(mutation) {
            let target = mutation.target;
            if (target.tagName === 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER' ||
                target.tagName === 'YT-LIVE-CHAT-PAID-MESSAGE-RENDERER') {
                let author = target.querySelector('#author-name').innerText;
                let message = target.querySelector('#message');
                let deleted = target.querySelector('#deleted-state').innerText;

                const varchars = {
                    // Diacritics
                    'ï':'i',

                    // Cyrillic
                    'а':'a', 'в':'b', 'с':'c', 'е':'e',
                    'н':'h', 'к':'k', 'м':'m', 'о':'o',
                    'р':'p', 'т':'t', 'х':'x',

                    // Math serif bold
                    '𝐀':'a', '𝐁':'b', '𝐂':'c', '𝐃':'d',
                    '𝐄':'e', '𝐅':'f', '𝐆':'g', '𝐇':'h',
                    '𝐈':'i', '𝐉':'j', '𝐊':'k', '𝐋':'l',
                    '𝐌':'m', '𝐍':'n', '𝐎':'o', '𝐏':'p',
                    '𝐐':'q', '𝐑':'r', '𝐒':'s', '𝐓':'t',
                    '𝐔':'u', '𝐕':'v', '𝐖':'w', '𝐗':'x',
                    '𝐘':'y', '𝐙':'z',

                    '𝐚':'a', '𝐛':'b', '𝐜':'c', '𝐝':'d',
                    '𝐞':'e', '𝐟':'f', '𝐠':'g', '𝐡':'h',
                    '𝐢':'i', '𝐣':'j', '𝐤':'k', '𝐥':'l',
                    '𝐦':'m', '𝐧':'n', '𝐨':'o', '𝐩':'p',
                    '𝐪':'q', '𝐫':'r', '𝐬':'s', '𝐭':'t',
                    '𝐮':'u', '𝐯':'v', '𝐰':'w', '𝐱':'x',
                    '𝐲':'y', '𝐳':'z',

                    // Math serif italic
                    '𝐴':'a', '𝐵':'b', '𝐶':'c', '𝐷':'d',
                    '𝐸':'e', '𝐹':'f', '𝐺':'g', '𝐻':'h',
                    '𝐼':'i', '𝐽':'j', '𝐾':'k', '𝐿':'l',
                    '𝑀':'m', '𝑁':'n', '𝑂':'o', '𝑃':'p',
                    '𝑄':'q', '𝑅':'r', '𝑆':'s', '𝑇':'t',
                    '𝑈':'u', '𝑉':'v', '𝑊':'w', '𝑋':'x',
                    '𝑌':'y', '𝑍':'z',

                    '𝑎':'a', '𝑏':'b', '𝑐':'c', '𝑑':'d',
                    '𝑒':'e', '𝑓':'f', '𝑔':'g', 'ℎ':'h',
                    '𝑖':'i', '𝑗':'j', '𝑘':'k', '𝑙':'l',
                    '𝑚':'m', '𝑛':'n', '𝑜':'o', '𝑝':'p',
                    '𝑞':'q', '𝑟':'r', '𝑠':'s', '𝑡':'t',
                    '𝑢':'u', '𝑣':'v', '𝑤':'w', '𝑥':'x',
                    '𝑦':'y', '𝑧':'z',

                    // Math serif bold italic
                    '𝑨':'a', '𝑩':'b', '𝑪':'c', '𝑫':'d',
                    '𝑬':'e', '𝑭':'f', '𝑮':'g', '𝑯':'h',
                    '𝑰':'i', '𝑱':'j', '𝑲':'k', '𝑳':'l',
                    '𝑴':'m', '𝑵':'n', '𝑶':'o', '𝑷':'p',
                    '𝑸':'q', '𝑹':'r', '𝑺':'s', '𝑻':'t',
                    '𝑼':'u', '𝑽':'v', '𝑾':'w', '𝑿':'x',
                    '𝒀':'y', '𝒁':'z',

                    '𝒂':'a', '𝒃':'b', '𝒄':'c', '𝒅':'d',
                    '𝒆':'e', '𝒇':'f', '𝒈':'g', '𝒉':'h',
                    '𝒊':'i', '𝒋':'j', '𝒌':'k', '𝒍':'l',
                    '𝒎':'m', '𝒏':'n', '𝒐':'o', '𝒑':'p',
                    '𝒒':'q', '𝒓':'r', '𝒔':'s', '𝒕':'t',
                    '𝒖':'u', '𝒗':'v', '𝒘':'w', '𝒙':'x',
                    '𝒚':'y', '𝒛':'z',

                    // Math sans serif
                    '𝖠':'a', '𝖡':'b', '𝖢':'c', '𝖣':'d',
                    '𝖤':'e', '𝖥':'f', '𝖦':'g', '𝖧':'h',
                    '𝖨':'i', '𝖩':'j', '𝖪':'k', '𝖫':'l',
                    '𝖬':'m', '𝖭':'n', '𝖮':'o', '𝖯':'p',
                    '𝖰':'q', '𝖱':'r', '𝖲':'s', '𝖳':'t',
                    '𝖴':'u', '𝖵':'v', '𝖶':'w', '𝖷':'x',
                    '𝖸':'y', '𝖹':'z',

                    '𝖺':'a', '𝖻':'b', '𝖼':'c', '𝖽':'d',
                    '𝖾':'e', '𝖿':'f', '𝗀':'g', '𝗁':'h',
                    '𝗂':'i', '𝗃':'j', '𝗄':'k', '𝗅':'l',
                    '𝗆':'m', '𝗇':'n', '𝗈':'o', '𝗉':'p',
                    '𝗊':'q', '𝗋':'r', '𝗌':'s', '𝗍':'t',
                    '𝗎':'u', '𝗏':'v', '𝗐':'w', '𝗑':'x',
                    '𝗒':'y', '𝗓':'z',

                    // Math sans serif bold
                    '𝗔':'a', '𝗕':'b', '𝗖':'c', '𝗗':'d',
                    '𝗘':'e', '𝗙':'f', '𝗚':'g', '𝗛':'h',
                    '𝗜':'i', '𝗝':'j', '𝗞':'k', '𝗟':'l',
                    '𝗠':'m', '𝗡':'n', '𝗢':'o', '𝗣':'p',
                    '𝗤':'q', '𝗥':'r', '𝗦':'s', '𝗧':'t',
                    '𝗨':'u', '𝗩':'v', '𝗪':'w', '𝗫':'x',
                    '𝗬':'y', '𝗭':'z',

                    '𝗮':'a', '𝗯':'b', '𝗰':'c', '𝗱':'d',
                    '𝗲':'e', '𝗳':'f', '𝗴':'g', '𝗵':'h',
                    '𝗶':'i', '𝗷':'j', '𝗸':'k', '𝗹':'l',
                    '𝗺':'m', '𝗻':'n', '𝗼':'o', '𝗽':'p',
                    '𝗾':'q', '𝗿':'r', '𝘀':'s', '𝘁':'t',
                    '𝘂':'u', '𝘃':'v', '𝘄':'w', '𝘅':'x',
                    '𝘆':'y', '𝘇':'z',

                    // Math sans serif italic
                    '𝘈':'a', '𝘉':'b', '𝘊':'c', '𝘋':'d',
                    '𝘌':'e', '𝘍':'f', '𝘎':'g', '𝘏':'h',
                    '𝘐':'i', '𝘑':'j', '𝘒':'k', '𝘓':'l',
                    '𝘔':'m', '𝘕':'n', '𝘖':'o', '𝘗':'p',
                    '𝘘':'q', '𝘙':'r', '𝘚':'s', '𝘛':'t',
                    '𝘜':'u', '𝘝':'v', '𝘞':'w', '𝘟':'x',
                    '𝘠':'y', '𝘡':'z',

                    '𝘢':'a', '𝘣':'b', '𝘤':'c', '𝘥':'d',
                    '𝘦':'e', '𝘧':'f', '𝘨':'g', '𝘩':'h',
                    '𝘪':'i', '𝘫':'j', '𝘬':'k', '𝘭':'l',
                    '𝘮':'m', '𝘯':'n', '𝘰':'o', '𝘱':'p',
                    '𝘲':'q', '𝘳':'r', '𝘴':'s', '𝘵':'t',
                    '𝘶':'u', '𝘷':'v', '𝘸':'w', '𝘹':'x',
                    '𝘺':'y', '𝘻':'z',

                    // Math sans serif bold italic
                    '𝘼':'a', '𝘽':'b', '𝘾':'c', '𝘿':'d',
                    '𝙀':'e', '𝙁':'f', '𝙂':'g', '𝙃':'h',
                    '𝙄':'i', '𝙅':'j', '𝙆':'k', '𝙇':'l',
                    '𝙈':'m', '𝙉':'n', '𝙊':'o', '𝙋':'p',
                    '𝙌':'q', '𝙍':'r', '𝙎':'s', '𝙏':'t',
                    '𝙐':'u', '𝙑':'v', '𝙒':'w', '𝙓':'𝙔',
                    'x':'y', '𝙕':'z',

                    '𝙖':'a', '𝙗':'b', '𝙘':'c', '𝙙':'d',
                    '𝙚':'e', '𝙛':'f', '𝙜':'g', '𝙝':'h',
                    '𝙞':'i', '𝙟':'j', '𝙠':'k', '𝙡':'l',
                    '𝙢':'m', '𝙣':'n', '𝙤':'o', '𝙥':'p',
                    '𝙦':'q', '𝙧':'r', '𝙨':'s', '𝙩':'t',
                    '𝙪':'u', '𝙫':'v', '𝙬':'w', '𝙭':'x',
                    '𝙮':'y', '𝙯':'z',

                    // Math script
                    '𝒜':'a', 'ℬ':'b', '𝒞':'c', '𝒟':'d',
                    'ℰ':'e', 'ℱ':'f', '𝒢':'g', 'ℋ':'h',
                    'ℐ':'i', '𝒥':'j', '𝒦':'k', 'ℒ':'l',
                    'ℳ':'m', '𝒩':'n', '𝒪':'o', '𝒫':'p',
                    '𝒬':'q', 'ℛ':'r', '𝒮':'s', '𝒯':'t',
                    '𝒰':'u', '𝒱':'v', '𝒲':'w', '𝒳':'x',
                    '𝒴':'y', '𝒵':'z',

                    '𝒶':'a', '𝒷':'b', '𝒸':'c', '𝒹':'d',
                    'ℯ':'e', '𝒻':'f', 'ℊ':'g', '𝒽':'h',
                    '𝒾':'i', '𝒿':'j', '𝓀':'k', '𝓁':'l',
                    '𝓂':'m', '𝓃':'n', 'ℴ':'o', '𝓅':'p',
                    '𝓆':'q', '𝓇':'r', '𝓈':'s', '𝓉':'t',
                    '𝓊':'u', '𝓋':'v', '𝓌':'w', '𝓍':'x',
                    '𝓎':'y', '𝓏':'z',

                    // Math script bold
                    '𝓐':'a', '𝓑':'b', '𝓒':'c', '𝓓':'d',
                    '𝓔':'e', '𝓕':'f', '𝓖':'g', '𝓗':'h',
                    '𝓘':'i', '𝓙':'j', '𝓚':'k', '𝓛':'l',
                    '𝓜':'m', '𝓝':'n', '𝓞':'o', '𝓟':'p',
                    '𝓠':'q', '𝓡':'r', '𝓢':'s', '𝓣':'t',
                    '𝓤':'u', '𝓥':'v', '𝓦':'w', '𝓧':'x',
                    '𝓨':'y', '𝓩':'z',

                    '𝓪':'a', '𝓫':'b', '𝓬':'c', '𝓭':'d',
                    '𝓮':'e', '𝓯':'f', '𝓰':'g', '𝓱':'h',
                    '𝓲':'i', '𝓳':'j', '𝓴':'k', '𝓵':'l',
                    '𝓶':'m', '𝓷':'n', '𝓸':'o', '𝓹':'p',
                    '𝓺':'q', '𝓻':'r', '𝓼':'s', '𝓽':'t',
                    '𝓾':'u', '𝓿':'v', '𝔀':'w', '𝔁':'x',
                    '𝔂':'y', '𝔃':'z',

                    // Math mono
                    '𝙰':'a', '𝙱':'b', '𝙲':'c', '𝙳':'d',
                    '𝙴':'e', '𝙵':'f', '𝙶':'g', '𝙷':'h',
                    '𝙸':'i', '𝙹':'j', '𝙺':'k', '𝙻':'l',
                    '𝙼':'m', '𝙽':'n', '𝙾':'o', '𝙿':'p',
                    '𝚀':'q', '𝚁':'r', '𝚂':'s', '𝚃':'t',
                    '𝚄':'u', '𝚅':'v', '𝚆':'w', '𝚇':'x',
                    '𝚈':'y', '𝚉':'z',

                    '𝚊':'a', '𝚋':'b', '𝚌':'c', '𝚍':'d',
                    '𝚎':'e', '𝚏':'f', '𝚐':'g', '𝚑':'h',
                    '𝚒':'i', '𝚓':'j', '𝚔':'k', '𝚕':'l',
                    '𝚖':'m', '𝚗':'n', '𝚘':'o', '𝚙':'p',
                    '𝚚':'q', '𝚛':'r', '𝚜':'s', '𝚝':'t',
                    '𝚞':'u', '𝚟':'v', '𝚠':'w', '𝚡':'x',
                    '𝚢':'y', '𝚣':'z',

                    // Math doublestruck
                    '𝔸':'a', '𝔹':'b', 'ℂ':'c', '𝔻':'d',
                    '𝔼':'e', '𝔽':'f', '𝔾':'g', 'ℍ':'h',
                    '𝕀':'i', '𝕁':'j', '𝕂':'k', '𝕃':'l',
                    '𝕄':'m', 'ℕ':'n', '𝕆':'o', 'ℙ':'p',
                    'ℚ':'q', 'ℝ':'r', '𝕊':'s', '𝕋':'t',
                    '𝕌':'u', '𝕍':'v', '𝕎':'w', '𝕏':'x',
                    '𝕐':'y', 'ℤ':'z',

                    '𝕒':'a', '𝕓':'b', '𝕔':'c', '𝕕':'d',
                    '𝕖':'e', '𝕗':'f', '𝕘':'g', '𝕙':'h',
                    '𝕚':'i', '𝕛':'j', '𝕜':'k', '𝕝':'l',
                    '𝕞':'m', '𝕟':'n', '𝕠':'o', '𝕡':'p',
                    '𝕢':'q', '𝕣':'r', '𝕤':'s', '𝕥':'t',
                    '𝕦':'u', '𝕧':'v', '𝕨':'w', '𝕩':'x',
                    '𝕪':'y', '𝕫':'z',
                };

                let normalize = new RegExp(`[${Object.keys(varchars).join('')}]`, 'gi');
                author = author.replaceAll(normalize, m => varchars[m.toLowerCase()]);

                message = Array.from(message.childNodes)
                    .map(function (node) {
                        if (node.tagName === 'IMG') {
                            if (/[a-zA-Z]/.test(node.alt)) {
                                return `:${node.alt}:`;
                            } else {
                                return node.alt;
                            }
                        }
                        return node.data;
                    })
                    .join(' ');

                if (SHOWALL) { console.log(author + ": " + message); }

                // Hide
                if (name_filter.some((re) => re.test(author)) ||
                    msg_filter.some((re) => re.test(message))) {
                    count++;
                    console.log("CAUGHT " + count + ":  " + author + ": " + message);
                    if (!deleted) {
                        let buttons = target.querySelectorAll('#inline-action-buttons button');
                        let del_btn = buttons[0];
                        let hide_btn = buttons[2];
                        del_btn.click();
                        hide_btn.click();
                    }
                }

                // Delete
                if (del_filter.some((re) => re.test(message))) {
                    console.log("DELETED:  " + author + ": " + message);
                    if (!deleted) {
                        let buttons = target.querySelectorAll('#inline-action-buttons button');
                        let del_btn = buttons[0];
                        del_btn.click();
                    }
                }
            }
        });
    }).observe(
        //root.getElementById('chat'),
        root.querySelector('#item-list.yt-live-chat-renderer'),
        { childList: true, subtree: true }
    );
})();

async function getRootNode(url) {
    if (url.match(/live_chat/)) {
        return document;
    }
    if (url.match(/watch\?v=/) || url.match(/live/)) {
        console.log("waiting for chat to load...");
        let chat = await new Promise((resolve) => {
            new MutationObserver((mutationsList, observer) => {
                let chatframe = document.querySelector('#chatframe');
                if(chatframe && chatframe.contentDocument.querySelector('#chat-messages')) {
                  resolve(chatframe);
                  observer.disconnect();
                }
            }).observe(document.body, {childList: true, subtree: true});
        });
        console.log("chat finished loading");

        if (chat.src.match(/live_chat\?/)) {
            return chat.contentDocument;
        }
    }
    return null;
}

function switchToLiveView(root) {
    root.querySelector('#view-selector #menu a:last-of-type').click();
}
