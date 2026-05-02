import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// The translations
const resources = {
  en: {
    translation: {
      "settings": "Settings",
      "language": "Language",
      "english": "English",
      "tamil": "Tamil",
      "hospital_name": "GOVT HOSPITAL VIRUDHACHALAM",
      "login_button": "Login",
      "modern_healthcare": "Modern Healthcare",
      "welcome_title": "WELCOME TO GOVT HOSPITAL VIRUDHACHALAM",
      "welcome_subtitle": "Streamlining patient admissions, optimizing hospital workflows, and delivering the best care possible with our state-of-the-art management system.",
      "access_portal": "Access Portal",
      "secure_system_title": "Secure System",
      "secure_system_desc": "End-to-end encrypted patient records and fast admission workflows.",
      "expert_care_title": "Expert Care",
      "expert_care_desc": "Connecting patients with specialized doctors instantly.",
      "footer_text": "GOVT HOSPITAL VIRUDHACHALAM - Hospital Admission System. All rights reserved.",
      "higher_official_login": "Higher Official Login",
      "admission_login": "Admission Login",
      "bill_register_login": "Bill Register Login",
      "stock_officer_login": "Stock Officer Login",
      "distribute_officer_login": "Distribute Officer Login",
      "assistant_login": "Assistant Login"
    }
  },
  ta: {
    translation: {
      "settings": "அமைப்புகள்",
      "language": "மொழி",
      "english": "ஆங்கிலம்",
      "tamil": "தமிழ்",
      "hospital_name": "அரசு மருத்துவமனை விருத்தாச்சலம்",
      "login_button": "உள்நுழைய",
      "modern_healthcare": "நவீன மருத்துவம்",
      "welcome_title": "அரசு மருத்துவமனை விருத்தாச்சலத்திற்கு உங்களை வரவேற்கிறோம்",
      "welcome_subtitle": "நோயாளிகளின் சேர்க்கையை எளிமையாக்குதல், மருத்துவமனை பணிகளை மேம்படுத்துதல் மற்றும் எங்களின் அதிநவீன மேலாண்மை அமைப்பு மூலம் சிறந்த சிகிச்சையை வழங்குதல்.",
      "access_portal": "நுழைவாயில் அணுகுக",
      "secure_system_title": "பாதுகாப்பான அமைப்பு",
      "secure_system_desc": "முழுமையான பாதுகாப்பான நோயாளி பதிவுகள் மற்றும் விரைவான சேர்க்கை நடைமுறைகள்.",
      "expert_care_title": "சிறந்த சிகிச்சை",
      "expert_care_desc": "சிறப்பு மருத்துவர்களுடன் நோயாளிகளை உடனுக்குடன் இணைக்கிறது.",
      "footer_text": "அரசு மருத்துவமனை விருத்தாச்சலம் - மருத்துவமனை சேர்க்கை அமைப்பு. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
      "higher_official_login": "உயரதிகாரி உள்நுழைவு",
      "admission_login": "சேர்க்கை உள்நுழைவு",
      "bill_register_login": "பில் பதிவு உள்நுழைவு",
      "stock_officer_login": "கையிருப்பு அதிகாரி உள்நுழைவு",
      "distribute_officer_login": "விநியோக அதிகாரி உள்நுழைவு",
      "assistant_login": "உதவியாளர் உள்நுழைவு"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
