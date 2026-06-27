const firebaseConfig = {
    apiKey: "ضع_هنا_API_KEY", // استبدل هذا بالمفتاح الحقيقي
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

// بدء الاتصال السحابي إذا كانت الإعدادات مدخلة
const hasRealConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== "ضع_هنا_API_KEY";
if (typeof firebase !== 'undefined' && hasRealConfig) {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}
