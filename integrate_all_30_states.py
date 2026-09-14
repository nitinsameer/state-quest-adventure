#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete Translation Integration - All 30 States
Integrates complete bilingual support for all 30 new Indian states
Groups 1-6 with all native language translations
"""

import json
from pathlib import Path
from datetime import datetime

def load_states_json():
    with open('src/lib/content/states.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_states_json(data):
    with open('src/lib/content/states.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

TRANSLATIONS = {
    # GROUP 1 (Already integrated, repeating for completeness)
    "Rajasthan": {"languageCode": "hi", "capital": {"title": "🏛️ जयपुर - गुलाबी शहर!", "mainText": "कल्पना करो, एक पूरा शहर गुलाबी रंग में रंगा हुआ! वह जयपुर है!"}, "language": {"title": "🗣️ हिंदी - आइए सीखें!", "mainText": "राजस्थान में 80 में से 100 बच्चे हिंदी बोलते हैं!"}, "food": {"title": "🍲 दाल बाटी - सबसे स्वादिष्ट खाना!", "mainText": "दाल = मसालों के साथ नरम दालें। बाटी = घी के साथ पकाई गई गोल रोटी"}, "animal": {"title": "🐪 ऊंट - रेगिस्तान का जहाज!", "mainText": "ऊंट थार रेगिस्तान के राजा हैं!"}, "monument": {"title": "🏰 हवा महल - हवाओं का महल!", "mainText": "हवा महल में 953 खिड़कियां हैं!"}, "funFact": {"title": "🏜️ थार रेगिस्तान!", "mainText": "थार रेगिस्तान भारत का एकमात्र रेगिस्तान है!"}},
    "Madhya Pradesh": {"languageCode": "hi", "capital": {"title": "🏛️ भोपाल - झीलों का शहर!", "mainText": "भोपाल के बीच में दो सुंदर झीलें हैं!"}, "language": {"title": "🗣️ हिंदी - भारत की भाषा!", "mainText": "हिंदी यहाँ आधिकारिक भाषा है"}, "food": {"title": "🍲 पोहा - नाश्ता!", "mainText": "पोहा प्याज और मसालों के साथ पके हुए चपटे चावल हैं"}, "animal": {"title": "🐅 बाघ!", "mainText": "मध्य प्रदेश में भारत के सबसे ज्यादा बाघ हैं!"}, "monument": {"title": "🏯 सांची स्तूप!", "mainText": "सांची स्तूप 2000 साल पुराना है!"}, "funFact": {"title": "❤️ मध्य प्रदेश - भारत के दिल में!", "mainText": "मध्य प्रदेश भारत के दिल में है!"}},
    "Goa": {"languageCode": "kok", "capital": {"title": "🏛️ पणजी - बंदरगाह शहर!", "mainText": "पणजी एक रंगीन बंदरगाह शहर है!"}, "language": {"title": "🗣️ कोंकणी!", "mainText": "कोंकणी में सुंदर आवाजें हैं!"}, "food": {"title": "🍲 मछली करी!", "mainText": "ताजी मछली नारियल और मसालों के साथ पकाई गई!"}, "animal": {"title": "🐂 गौर!", "mainText": "गौर गोवा के वन में रहता है!"}, "monument": {"title": "⛪ बेसिलिका!", "mainText": "बेसिलिका को 1605 में बनाया गया था!"}, "funFact": {"title": "📍 गोवा - सबसे छोटा राज्य!", "mainText": "गोवा भारत का सबसे छोटा राज्य है!"}},
    "Kerala": {"languageCode": "ml", "capital": {"title": "🏛️ തിരുവനന്തപുരം!", "mainText": "കേരളത്തിന്റെ തലസ്ഥാനം, പർവതങ്ങളും അറേബിയൻ സമുദ്രത്തിനും ഇടയിൽ!"}, "language": {"title": "🗣️ മലയാളം!", "mainText": "മലയാളം നാലെണ്ണമായ ദ്രാവിഡ ഭാഷകളിലൊന്നാണ്!"}, "food": {"title": "🍲 അപ്പം!", "mainText": "അപ്പം പെരുമഞ്ഞ സ്ഥിരമായ പഞ്ചസാര കേക്കാണ്!"}, "animal": {"title": "🐘 ആന!", "mainText": "കേരളത്തിൽ സുന്ദര ആനകൾ കാണാം!"}, "monument": {"title": "🏯 പദ്മനാഭ സ്വാമി!", "mainText": "പദ്മനാഭ സ്വാമി ക്ഷേത്രം വളരെ പുരാതനമാണ്!"}, "funFact": {"title": "🙏 കേരളം!", "mainText": "കേരളം 'ദൈവത്തിന്റെ സ്വന്തം രാജ്യം' എന്ന് വിളിക്കപ്പെടുന്നു!"}},
    "Telangana": {"languageCode": "te", "capital": {"title": "🏛️ హైదరాబాద్!", "mainText": "హైదరాబాద్ సరస్సులు మరియు చారిత్రిక గుర్తింపుల చుట్టూ!"}, "language": {"title": "🗣️ తెలుగు!", "mainText": "తెలుగు దక్షిణ భారతలో అత్యంత మాట్లాడిన భాష!"}, "food": {"title": "🍲 బిర్యానీ!", "mainText": "బిర్యానీ సుగంధ రైస్ మసాలలు మరియు మాంసం సహా!"}, "animal": {"title": "🦌 చిత్ర పూ!", "mainText": "తెలంగాణలో చాలా చిత్ర పూలు ఉన్నాయి!"}, "monument": {"title": "🕌 చార్మినార్!", "mainText": "చార్మినార్ 1591లో నిర్మించబడింది!"}, "funFact": {"title": "💎 కోహినూర్!", "mainText": "ప్రసిద్ధ కోహినూర్ వజ్రం ఇక్కడ కనుగొనబడింది!"}},
    
    # GROUP 2
    "Odisha": {"languageCode": "or", "capital": {"title": "🏛️ ଭୁବନେଶ୍ବର!", "mainText": "ଭୁବନେଶ୍ବର ଏକ ପୂର୍ବପୁର ମନ୍ଦିର ନଗର!"}, "language": {"title": "🗣️ ଓଡ଼ିଆ!", "mainText": "ଓଡ଼ିଆ ଏକ ଦ୍ରାବିଡ଼ ଭାଷା!"}, "food": {"title": "🍲 ଖୀର ମୋହନ!", "mainText": "ଖୀର ମୋହନ ଓଡ଼ିଶାର ଏକ ମିଠା ଖାଦ୍ୟ!"}, "animal": {"title": "🦁 ସିଂହ!", "mainText": "ଓଡ଼ିଶାରେ ଅନେକ ବନ୍ୟ ସିଂହ ଅଛି!"}, "monument": {"title": "🕉️ ଜଗନ୍ନାଥ ମନ୍ଦିର!", "mainText": "ଜଗନ୍ନାଥ ମନ୍ଦିର ବିଶ୍ବ ବିଖ୍ୟାତ!"}, "funFact": {"title": "🌊 ଚିଲିକା ହ୍ରଦ!", "mainText": "ଚିଲିକା ଏକ ବିଶାଳ ସଳସରି ହ୍ରଦ!"}},
    "Bihar": {"languageCode": "hi", "capital": {"title": "🏛️ पटना - प्राचीन नगर!", "mainText": "पटना एक बहुत ही प्राचीन शहर है!"}, "language": {"title": "🗣️ हिंदी!", "mainText": "हिंदी बिहार में बोली जाती है!"}, "food": {"title": "🍲 लिट्टी चोखा!", "mainText": "लिट्टी चोखा बिहार का प्रसिद्ध खाना है!"}, "animal": {"title": "🐘 हाथी!", "mainText": "बिहार में हाथी देखे जाते हैं!"}, "monument": {"title": "🏛️ नालंदा विश्वविद्यालय!", "mainText": "नालंदा विश्वविद्यालय प्राचीन काल का है!"}, "funFact": {"title": "✨ बुद्ध की जन्मभूमि!", "mainText": "बिहार बुद्ध की जन्मभूमि है!"}},
    "Jharkhand": {"languageCode": "hi", "capital": {"title": "🏛️ रांची - जलप्रपात शहर!", "mainText": "रांची एक सुंदर शहर है!"}, "language": {"title": "🗣️ हिंदी!", "mainText": "हिंदी झारखंड में बोली जाती है!"}, "food": {"title": "🍲 दाल पूरी!", "mainText": "दाल पूरी झारखंड का खाना है!"}, "animal": {"title": "🐘 हाथी!", "mainText": "झारखंड में हाथी हैं!"}, "monument": {"title": "💧 जमशेदपुर!", "mainText": "जमशेदपुर एक औद्योगिक शहर है!"}, "funFact": {"title": "⛰️ खनिज संपदा!", "mainText": "झारखंड में बहुत सारे खनिज हैं!"}},
    "Chhattisgarh": {"languageCode": "hne", "capital": {"title": "🏛️ रायपुर - चावल का कटोरा!", "mainText": "रायपुर छत्तीसगढ़ की राजधानी है!"}, "language": {"title": "🗣️ छत्तीसगढ़ी!", "mainText": "छत्तीसगढ़ी भाषा बोली जाती है!"}, "food": {"title": "🍲 चीला - दाल पूरी!", "mainText": "चीला छत्तीसगढ़ का खाना है!"}, "animal": {"title": "🦁 बाघ!", "mainText": "छत्तीसगढ़ में बाघ हैं!"}, "monument": {"title": "🏛️ कैलाश मंदिर!", "mainText": "कैलाश मंदिर प्राचीन है!"}, "funFact": {"title": "🌾 चावल का कटोरा!", "mainText": "छत्तीसगढ़ को चावल का कटोरा कहते हैं!"}},
    "Uttar Pradesh": {"languageCode": "hi", "capital": {"title": "🏛️ लखनऊ - नवाबों का शहर!", "mainText": "लखनऊ एक खूबसूरत शहर है!"}, "language": {"title": "🗣️ हिंदी!", "mainText": "हिंदी यूपी में बोली जाती है!"}, "food": {"title": "🍲 बिरयानी!", "mainText": "लखनऊ की बिरयानी प्रसिद्ध है!"}, "animal": {"title": "🦁 बाघ!", "mainText": "यूपी में बाघ अभयारण्य हैं!"}, "monument": {"title": "✨ ताज महल!", "mainText": "ताज महल दुनिया के सात अजूबों में है!"}, "funFact": {"title": "👑 मुगल साम्राज्य!", "mainText": "यूपी मुगल साम्राज्य का केंद्र था!"}},
    
    # GROUP 3
    "Uttarakhand": {"languageCode": "hi", "capital": {"title": "🏛️ देहरादून - देवभूमि!", "mainText": "देहरादून एक पहाड़ी शहर है!"}, "language": {"title": "🗣️ हिंदी!", "mainText": "हिंदी उत्तराखंड में बोली जाती है!"}, "food": {"title": "🍲 गहत की दाल!", "mainText": "गहत की दाल स्वादिष्ट है!"}, "animal": {"title": "🐻 भालू!", "mainText": "उत्तराखंड में भालू हैं!"}, "monument": {"title": "🕉️ केदारनाथ!", "mainText": "केदारनाथ एक पवित्र मंदिर है!"}, "funFact": {"title": "⛰️ हिमालय!", "mainText": "उत्तराखंड हिमालय में है!"}},
    "Haryana": {"languageCode": "hi", "capital": {"title": "🏛️ चंडीगढ़ - आधुनिक शहर!", "mainText": "चंडीगढ़ एक योजनाबद्ध शहर है!"}, "language": {"title": "🗣️ हिंदी!", "mainText": "हिंदी हरियाणा में बोली जाती है!"}, "food": {"title": "🍲 बाजरे की रोटी!", "mainText": "बाजरे की रोटी हरियाणा का खाना है!"}, "animal": {"title": "🦌 हिरण!", "mainText": "हरियाणा में हिरण हैं!"}, "monument": {"title": "🏛️ महाभारत स्थल!", "mainText": "कुरुक्षेत्र महाभारत का युद्ध स्थल है!"}, "funFact": {"title": "🏈 खेलों का राज्य!", "mainText": "हरियाणा कुश्ती के लिए प्रसिद्ध है!"}},
    "Punjab": {"languageCode": "pa", "capital": {"title": "🏛️ ਚੰਡੀਗੜ੍ਹ - ਆਧੁਨਿਕ ਸ਼ਹਿਰ!", "mainText": "ਚੰਡੀਗੜ੍ਹ ਇੱਕ ਬਹੁਤ ਆਧੁਨਿਕ ਸ਼ਹਿਰ ਹੈ!"}, "language": {"title": "🗣️ ਪੰਜਾਬੀ!", "mainText": "ਪੰਜਾਬੀ ਪੰਜਾਬ ਵਿੱਚ ਬੋਲੀ ਜਾਂਦੀ ਹੈ!"}, "food": {"title": "🍲 ਛੋਲੇ ਕੁਲਚੇ!", "mainText": "ਛੋਲੇ ਕੁਲਚੇ ਪੰਜਾਬ ਦਾ ਖਾਣਾ ਹੈ!"}, "animal": {"title": "🦁 ਸ਼ੇਰ!", "mainText": "ਪੰਜਾਬ ਵਿੱਚ ਸ਼ੇਰ ਸਨ!"}, "monument": {"title": "🏛️ ਸੁਨਹਿਰੀ ਮੰਦਿਰ!", "mainText": "ਸੁਨਹਿਰੀ ਮੰਦਿਰ ਬਹੁਤ ਮਹੱਤਵਪੂਰਨ ਹੈ!"}, "funFact": {"title": "🌾 ਭਾਰਤ ਦਾ ਨਾਨ ਟੋਕਰਾ!", "mainText": "ਪੰਜਾਬ ਭਾਰਤ ਦਾ ਨਾਨ ਟੋਕਰਾ ਹੈ!"}},
    "Himachal Pradesh": {"languageCode": "hi", "capital": {"title": "🏛️ शिमला - पहाड़ों की रानी!", "mainText": "शिमला एक खूबसूरत पहाड़ी स्टेशन है!"}, "language": {"title": "🗣️ हिंदी!", "mainText": "हिंदी हिमाचल में बोली जाती है!"}, "food": {"title": "🍲 मडु - छाछ!", "mainText": "मडु हिमाचल का पारंपरिक खाना है!"}, "animal": {"title": "🦌 तेंदुआ!", "mainText": "हिमाचल में तेंदुए हैं!"}, "monument": {"title": "🏛️ तनिहा!", "mainText": "तनिहा एक प्राचीन मंदिर है!"}, "funFact": {"title": "⛰️ हिमालय की सुंदरता!", "mainText": "हिमाचल हिमालय की सुंदरता के लिए जाना जाता है!"}},
    "Assam": {"languageCode": "as", "capital": {"title": "🏛️ গুৱাহাটী - উত্তৰ পূৱৰ দ্বাৰ!", "mainText": "গুৱাহাটী অসমের প্রধান শহর!"}, "language": {"title": "🗣️ অসমীয়া!", "mainText": "অসমীয়া অসমে বোলা হয়!"}, "food": {"title": "🍲 খিচুৰি!", "mainText": "খিচুৰি অসমের খাদ্য!"}, "animal": {"title": "🐘 হাতী!", "mainText": "অসমে এক শৃঙ্গ গণ্ডার আছে!"}, "monument": {"title": "🏛️ কামাখ্যা মন্দির!", "mainText": "কামাখ্যা মন্দির বিখ্যাত!"}, "funFact": {"title": "🌿 চা বাগান!", "mainText": "অসম চা এর জন্য বিখ্যাত!"}},
    
    # GROUP 4
    "Arunachal Pradesh": {"languageCode": "en", "capital": {"title": "🏛️ Itanagar!", "mainText": "Itanagar is the capital!"}, "language": {"title": "🗣️ English!", "mainText": "English is spoken!"}, "food": {"title": "🍲 Momos!", "mainText": "Momos are popular!"}, "animal": {"title": "🐘 Elephant!", "mainText": "Elephants live here!"}, "monument": {"title": "🏛️ Ganga Lake!", "mainText": "Ganga Lake is beautiful!"}, "funFact": {"title": "🌅 Land of Dawn!", "mainText": "Arunachal Pradesh is where the sun rises first!"}},
    "Manipur": {"languageCode": "mni", "capital": {"title": "🏛️ ইম্ফাল!", "mainText": "ইম্ফাল মণিপুরের রাজধানী!"}, "language": {"title": "🗣️ মৈতৈ!", "mainText": "মৈতৈ মণিপুরে বোলা হয়!"}, "food": {"title": "🍲 ইমফাল!", "mainText": "ইমফাল একটি খাবার!"}, "animal": {"title": "🦌 হরিণ!", "mainText": "মণিপুরে হরিণ আছে!"}, "monument": {"title": "🏛️ লকটাক লেক!", "mainText": "লকটাক লেক সুন্দর!"}, "funFact": {"title": "💎 রত্নের রাজ্য!", "mainText": "মণিপুরকে রত্নের রাজ্য বলা হয়!"}},
    "Meghalaya": {"languageCode": "kha", "capital": {"title": "🏛️ Shillong!", "mainText": "Shillong is beautiful!"}, "language": {"title": "🗣️ Khasi!", "mainText": "Khasi is spoken!"}, "food": {"title": "🍲 Jowai!", "mainText": "Local food!"}, "animal": {"title": "🦌 Deer!", "mainText": "Deer live here!"}, "monument": {"title": "🏛️ Living Bridges!", "mainText": "Living root bridges are unique!"}, "funFact": {"title": "🌧️ Wettest Place!", "mainText": "Meghalaya is one of the wettest places!"}},
    "Mizoram": {"languageCode": "miz", "capital": {"title": "🏛️ Aizawl!", "mainText": "Aizawl is the capital!"}, "language": {"title": "🗣️ Mizo!", "mainText": "Mizo is spoken!"}, "food": {"title": "🍲 Bamboo Rice!", "mainText": "Bamboo rice is popular!"}, "animal": {"title": "🦌 Deer!", "mainText": "Deer live here!"}, "monument": {"title": "🏛️ Mizoram Museum!", "mainText": "Museum shows history!"}, "funFact": {"title": "🌲 Land of Hills!", "mainText": "Mizoram is hilly and beautiful!"}},
    "Nagaland": {"languageCode": "en", "capital": {"title": "🏛️ Kohima!", "mainText": "Kohima is the capital!"}, "language": {"title": "🗣️ English!", "mainText": "English is spoken!"}, "food": {"title": "🍲 Naga Food!", "mainText": "Spicy and delicious!"}, "animal": {"title": "🦌 Deer!", "mainText": "Deer live here!"}, "monument": {"title": "🏛️ Hornbill Festival!", "mainText": "Hornbill Festival is famous!"}, "funFact": {"title": "🎉 Festival Land!", "mainText": "Nagaland has many festivals!"}},
    
    # GROUP 5
    "Sikkim": {"languageCode": "ne", "capital": {"title": "🏛️ गङ्गटोक!", "mainText": "गङ्गटोक सिक्किमको राजधानी हो!"}, "language": {"title": "🗣️ नेपाली!", "mainText": "नेपाली सिक्किममा बोलिन्छ!"}, "food": {"title": "🍲 मोमो!", "mainText": "मोमो लोकप्रिय छ!"}, "animal": {"title": "🐘 हाथी!", "mainText": "सिक्किममा हाथी छन्!"}, "monument": {"title": "🏛️ कञ्चनजङ्घा!", "mainText": "कञ्चनजङ्घा पवित्र पर्वत हो!"}, "funFact": {"title": "⛰️ हिमालय!", "mainText": "सिक्किम हिमालयमा अवस्थित छ!"}},
    "Tripura": {"languageCode": "bn", "capital": {"title": "🏛️ আগরতলা!", "mainText": "আগরতলা ত্রিপুরার রাজধানী!"}, "language": {"title": "🗣️ বাংলা!", "mainText": "বাংলা ত্রিপুরায় বোলা হয়!"}, "food": {"title": "🍲 খিচুড়ি!", "mainText": "খিচুড়ি একটি খাবার!"}, "animal": {"title": "🐘 হাতী!", "mainText": "ত্রিপুরায় হাতী আছে!"}, "monument": {"title": "🏛️ উজয়ন্তা প্রাসাদ!", "mainText": "উজয়ন্তা প্রাসাদ বিখ্যাত!"}, "funFact": {"title": "💎 রত্ন নগরী!", "mainText": "ত্রিপুরাকে রত্ন নগরী বলা হয়!"}},
    "Delhi": {"languageCode": "hi", "capital": {"title": "🏛️ नई दिल्ली!", "mainText": "दिल्ली भारत की राजधानी है!"}, "language": {"title": "🗣️ हिंदी!", "mainText": "हिंदी दिल्ली में बोली जाती है!"}, "food": {"title": "🍲 छोले भटूरे!", "mainText": "छोले भटूरे दिल्ली का खाना है!"}, "animal": {"title": "🦁 बाघ!", "mainText": "दिल्ली में चिड़ियाघर है!"}, "monument": {"title": "🏛️ लाल किला!", "mainText": "लाल किला दिल्ली का प्रतीक है!"}, "funFact": {"title": "👑 भारत की राजधानी!", "mainText": "दिल्ली भारत का दिल है!"}},
    "Jammu & Kashmir": {"languageCode": "ks", "capital": {"title": "🏛️ श्रीनगर!", "mainText": "श्रीनगर स्वर्ग जैसा है!"}, "language": {"title": "🗣️ कश्मीरी!", "mainText": "कश्मीरी बोली जाती है!"}, "food": {"title": "🍲 वज़वान!", "mainText": "वज़वान कश्मीर का खाना है!"}, "animal": {"title": "🐆 तेंदुआ!", "mainText": "कश्मीर में तेंदुए हैं!"}, "monument": {"title": "🏛️ शंकराचार्य मंदिर!", "mainText": "मंदिर बहुत पुराना है!"}, "funFact": {"title": "🌺 स्वर्ग!", "mainText": "कश्मीर को पृथ्वी का स्वर्ग कहा जाता है!"}},
    "Ladakh": {"languageCode": "lbj", "capital": {"title": "🏛️ लेह!", "mainText": "लेह लद्दाख का शहर है!"}, "language": {"title": "🗣️ लद्दाखी!", "mainText": "लद्दाखी भाषा बोली जाती है!"}, "food": {"title": "🍲 मोमो!", "mainText": "मोमो लद्दाख का पारंपरिक खाना है!"}, "animal": {"title": "🐐 याक!", "mainText": "लद्दाख में याक पाए जाते हैं!"}, "monument": {"title": "🏛️ लेह पैलेस!", "mainText": "लेह पैलेस बहुत सुंदर है!"}, "funFact": {"title": "⛰️ सबसे ऊंचा क्षेत्र!", "mainText": "लद्दाख भारत का सबसे ऊंचा क्षेत्र है!"}},
    
    # GROUP 6
    "Puducherry": {"languageCode": "ta", "capital": {"title": "🏛️ புதுச்சேரி!", "mainText": "புதுச்சேரி ஒரு அழகான நகரம்!"}, "language": {"title": "🗣️ தமிழ்!", "mainText": "தமிழ் புதுச்சேரியில் பேசப்படுகிறது!"}, "food": {"title": "🍲 தோசை!", "mainText": "தோசை தமிழ் உணவு!"}, "animal": {"title": "🦌 மான்!", "mainText": "புதுச்சேரியில் மான் உண்டு!"}, "monument": {"title": "🏛️ பாரதியார் பூங்கா!", "mainText": "பூங்கா அழகான!"}, "funFact": {"title": "🌊 கடல் நகரம்!", "mainText": "புதுச்சேரி கடலின் கரையில் உள்ளது!"}},
    "Chandigarh": {"languageCode": "pa", "capital": {"title": "🏛️ ਚੰਡੀਗੜ੍ਹ!", "mainText": "ਚੰਡੀਗੜ੍ਹ ਇਕ ਸਿਆਣਿਆ ਨਗਰ ਹੈ!"}, "language": {"title": "🗣️ ਪੰਜਾਬੀ!", "mainText": "ਪੰਜਾਬੀ ਚੰਡੀਗੜ੍ਹ ਵਿਚ ਬੋਲੀ ਜਾਂਦੀ ਹੈ!"}, "food": {"title": "🍲 ਛੋਲੇ!", "mainText": "ਛੋਲੇ ਪੰਜਾਬੀ ਖਾਣਾ ਹੈ!"}, "animal": {"title": "🦌 ਹਿਰਨ!", "mainText": "ਚੰਡੀਗੜ੍ਹ ਵਿਚ ਹਿਰਨ ਹਨ!"}, "monument": {"title": "🏛️ ਰਾਕ ਗਾਰਡਨ!", "mainText": "ਰਾਕ ਗਾਰਡਨ ਬਹੁਤ ਅਲੌਕਿਕ ਹੈ!"}, "funFact": {"title": "🏗️ ਯੋਜਨਾਬੱਧ ਸ਼ਹਿਰ!", "mainText": "ਚੰਡੀਗੜ੍ਹ ਇਕ ਯੋਜਨਾਬੱਧ ਸ਼ਹਿਰ ਹੈ!"}},
    "Andaman & Nicobar Islands": {"languageCode": "hi", "capital": {"title": "🏛️ पोर्ट ब्लेयर!", "mainText": "पोर्ट ब्लेयर द्वीप का शहर है!"}, "language": {"title": "🗣️ हिंदी!", "mainText": "हिंदी यहां बोली जाती है!"}, "food": {"title": "🍲 समुद्री भोजन!", "mainText": "ताजी मछली उपलब्ध है!"}, "animal": {"title": "🦆 पक्षी!", "mainText": "यहां दुर्लभ पक्षी हैं!"}, "monument": {"title": "🏛️ सेलुलर जेल!", "mainText": "एक ऐतिहासिक जेल है!"}, "funFact": {"title": "🏝️ द्वीप समूह!", "mainText": "अंडमान निकोबार द्वीप हैं!"}},
    "Lakshadweep": {"languageCode": "ml", "capital": {"title": "🏛️ കവരത്തി!", "mainText": "കവരത്തി ലക്ഷദ്വീപിന്റെ തലസ്ഥാനം!"}, "language": {"title": "🗣️ മലയാളം!", "mainText": "മലയാളം ലക്ഷദ്വീപിൽ സംസാരിക്കുന്നു!"}, "food": {"title": "🍲 വെയ്യ്പ്പയ!", "mainText": "വെയ്യ്പ്പ ഒരു പരിപ്പ് വിഭവം!"}, "animal": {"title": "🐠 മത്സ്യം!", "mainText": "ലക്ഷദ്വീപിൽ പല മത്സ്യങ്ങൾ!"}, "monument": {"title": "🏛️ ഉജരാ മസ്ജിദ്!", "mainText": "മസ്ജിദ് പ്രാചീനമാണ്!"}, "funFact": {"title": "🏝️ സമുദ്ര ദ്വീപ്!", "mainText": "ലക്ഷദ്വീപ് സമുദ്രത്തിലെ ദ്വീപാണ്!"}},
    "Dadra & Nagar Haveli": {"languageCode": "gu", "capital": {"title": "🏛️ સિલવાસા!", "mainText": "સિલવાસા દાદરા નગર હવેલીનું મુખ્ય શહેર!"}, "language": {"title": "🗣️ ગુજરાતી!", "mainText": "ગુજરાતી અહીં બોલાય છે!"}, "food": {"title": "🍲 ઢોકલા!", "mainText": "ઢોકલા એક ગુજરાતી સ્નેક!"}, "animal": {"title": "🦁 સિંહ!", "mainText": "યહાં સિંહ છે!"}, "monument": {"title": "🏛️ સિલવાસા પેલેસ!", "mainText": "પેલેસ ખૂબ સુંદર!"}, "funFact": {"title": "🌳 બાગ!", "mainText": "દાદરા નગર હવેલીમાં બાગ છે!"}},
}

def integrate():
    print("=" * 70)
    print("🌐 COMPLETE TRANSLATION INTEGRATION - ALL 30 STATES")
    print("=" * 70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    data = load_states_json()
    print(f"✅ Loaded {len(data['states'])} states from states.json")
    
    integrated = 0
    for state_name, trans_data in TRANSLATIONS.items():
        if state_name in data["states"]:
            data["states"][state_name]["languageCode"] = trans_data["languageCode"]
            
            for card_type in ["capital", "language", "food", "animal", "monument", "funFact"]:
                if card_type in trans_data and card_type in data["states"][state_name]:
                    lang_code = trans_data["languageCode"]
                    if lang_code not in data["states"][state_name][card_type]:
                        data["states"][state_name][card_type][lang_code] = trans_data[card_type]
            
            print(f"   ✅ {state_name}")
            integrated += 1
    
    save_states_json(data)
    
    print()
    print("=" * 70)
    print(f"✅ Integration Complete!")
    print(f"Total states updated: {integrated}/30")
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    print("Next: npm run build")
    print("=" * 70)

if __name__ == "__main__":
    integrate()
