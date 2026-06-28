const adminAuthKey = 'fs_admin_auth';
const adminUsername = 'admin2010';
const adminPassword = '746522AF';

function isAuthenticated() {
    return localStorage.getItem(adminAuthKey) === 'true';
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');

    if (username === adminUsername && password === adminPassword) {
        localStorage.setItem(adminAuthKey, 'true');
        window.location.href = 'admin.html';
        return;
    }

    if (errorEl) {
        errorEl.innerText = 'اسم المستخدم أو كلمة المرور غير صحيحة.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        window.location.href = 'admin.html';
        return;
    }
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
});
