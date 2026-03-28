WELCOME_TEXT_EN = """\
Welcome to Språkapp

This app helps you learn languages by reading real texts. Click on any word while reading to see its translation in the panel on the right. To translate a phrase, hold and drag across multiple words — this works on both desktop and phone.

You can upload PDF books and articles, or paste text directly. Everything is saved so you can come back and continue reading anytime.

To save words you want to remember, click a word, wait for the translation to appear, and add it to a vocabulary list. Then go to the Vocab section to practice with flashcards.

This is your first document. Try tapping a word, or hold and drag to select a phrase!
"""

# Basic vocabulary: (English native, target word)
BASIC_VOCAB: dict[str, list[tuple[str, str]]] = {
    "ar": [("hello", "مرحبا"), ("goodbye", "وداعاً"), ("thank you", "شكراً"), ("please", "من فضلك"), ("yes", "نعم"), ("no", "لا"), ("water", "ماء"), ("food", "طعام"), ("good", "جيد"), ("friend", "صديق")],
    "zh": [("hello", "你好"), ("goodbye", "再见"), ("thank you", "谢谢"), ("please", "请"), ("yes", "是"), ("no", "不"), ("water", "水"), ("food", "食物"), ("good", "好"), ("friend", "朋友")],
    "da": [("hello", "hej"), ("goodbye", "farvel"), ("thank you", "tak"), ("please", "venligst"), ("yes", "ja"), ("no", "nej"), ("water", "vand"), ("food", "mad"), ("good", "godt"), ("friend", "ven")],
    "nl": [("hello", "hallo"), ("goodbye", "tot ziens"), ("thank you", "dank je"), ("please", "alsjeblieft"), ("yes", "ja"), ("no", "nee"), ("water", "water"), ("food", "eten"), ("good", "goed"), ("friend", "vriend")],
    "fr": [("hello", "bonjour"), ("goodbye", "au revoir"), ("thank you", "merci"), ("please", "s'il vous plaît"), ("yes", "oui"), ("no", "non"), ("water", "eau"), ("food", "nourriture"), ("good", "bien"), ("friend", "ami")],
    "de": [("hello", "Hallo"), ("goodbye", "Auf Wiedersehen"), ("thank you", "Danke"), ("please", "Bitte"), ("yes", "Ja"), ("no", "Nein"), ("water", "Wasser"), ("food", "Essen"), ("good", "gut"), ("friend", "Freund")],
    "it": [("hello", "ciao"), ("goodbye", "arrivederci"), ("thank you", "grazie"), ("please", "per favore"), ("yes", "sì"), ("no", "no"), ("water", "acqua"), ("food", "cibo"), ("good", "buono"), ("friend", "amico")],
    "ja": [("hello", "こんにちは"), ("goodbye", "さようなら"), ("thank you", "ありがとう"), ("please", "お願い"), ("yes", "はい"), ("no", "いいえ"), ("water", "水"), ("food", "食べ物"), ("good", "良い"), ("friend", "友達")],
    "ko": [("hello", "안녕하세요"), ("goodbye", "안녕히 가세요"), ("thank you", "감사합니다"), ("please", "제발"), ("yes", "네"), ("no", "아니요"), ("water", "물"), ("food", "음식"), ("good", "좋아요"), ("friend", "친구")],
    "no": [("hello", "hei"), ("goodbye", "ha det"), ("thank you", "takk"), ("please", "vær så snill"), ("yes", "ja"), ("no", "nei"), ("water", "vann"), ("food", "mat"), ("good", "bra"), ("friend", "venn")],
    "pl": [("hello", "cześć"), ("goodbye", "do widzenia"), ("thank you", "dziękuję"), ("please", "proszę"), ("yes", "tak"), ("no", "nie"), ("water", "woda"), ("food", "jedzenie"), ("good", "dobry"), ("friend", "przyjaciel")],
    "pt": [("hello", "olá"), ("goodbye", "adeus"), ("thank you", "obrigado"), ("please", "por favor"), ("yes", "sim"), ("no", "não"), ("water", "água"), ("food", "comida"), ("good", "bom"), ("friend", "amigo")],
    "ru": [("hello", "привет"), ("goodbye", "до свидания"), ("thank you", "спасибо"), ("please", "пожалуйста"), ("yes", "да"), ("no", "нет"), ("water", "вода"), ("food", "еда"), ("good", "хорошо"), ("friend", "друг")],
    "es": [("hello", "hola"), ("goodbye", "adiós"), ("thank you", "gracias"), ("please", "por favor"), ("yes", "sí"), ("no", "no"), ("water", "agua"), ("food", "comida"), ("good", "bueno"), ("friend", "amigo")],
    "sv": [("hello", "hej"), ("goodbye", "hejdå"), ("thank you", "tack"), ("please", "snälla"), ("yes", "ja"), ("no", "nej"), ("water", "vatten"), ("food", "mat"), ("good", "bra"), ("friend", "vän")],
}
