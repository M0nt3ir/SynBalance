// SynBalance - Sistema de Login Distribuído
// JavaScript para gerenciamento de login e sessão

// ✅ SOLUÇÃO: Usar o mesmo domínio (proxy reverso via Nginx)
const BACKEND_URL = window.location.origin;

// Elementos do DOM
const loginSection = document.getElementById('loginSection');
const profileSection = document.getElementById('profileSection');
const loginForm = document.getElementById('loginForm');
const serverNameEl = document.getElementById('serverName');
const passwordToggle = document.getElementById('passwordToggle');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const usernameInput = document.getElementById('username');

// Inicialização quando a página carrega
window.addEventListener('load', () => {
    loadServerInfo();
    checkSession();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Toggle de senha
    passwordToggle.addEventListener('click', togglePasswordVisibility);
    
    // Submit do formulário
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Prevenir comportamento padrão do link "Esqueceu a senha"
    const forgotPasswordLink = document.querySelector('.link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Funcionalidade de recuperação de senha em desenvolvimento.');
        });
    }
}

// Buscar informações do servidor (hostname)
async function loadServerInfo() {
    try {
        // Busca o arquivo local mapeado pelo Docker
        const response = await fetch('nome_servidor.txt'); 

        if (!response.ok) {
            throw new Error('Falha ao buscar hostname');
        }

        const text = await response.text();
        serverNameEl.textContent = text.trim() || 'Servidor Desconhecido';
    } catch (error) {
        serverNameEl.textContent = 'Erro ao ler servidor';
        console.error('Erro:', error);
    }
}

// Toggle visibilidade da senha
function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    
    // Opcional: mudar ícone
    passwordToggle.setAttribute('aria-label', 
        type === 'text' ? 'Ocultar senha' : 'Mostrar senha'
    );
}

// Verificar se já existe uma sessão ativa
async function checkSession() {
    try {
        console.log('🔍 Verificando sessão existente...');
        console.log('🍪 Cookies atuais:', document.cookie);
        
        const response = await fetch(`${BACKEND_URL}/api/perfil`, {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Sessão válida encontrada:', data);
            showProfile(data);
        } else {
            console.log('❌ Nenhuma sessão válida');
        }
    } catch (error) {
        console.log('⚠️ Erro ao verificar sessão:', error);
    }
}

// Lidar com o login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Validação básica
    if (!username || !password) {
        showError('Por favor, preencha todos os campos');
        return;
    }

    // Mostrar estado de carregamento
    setLoading(true);

    try {
        const response = await fetch(`${BACKEND_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
                login: username, 
                senha: password 
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Cookie já foi enviado pelo backend automaticamente
            console.log('✅ Login bem-sucedido! Cookie recebido.');
            
            // Mostrar perfil
            showProfile(data);
            
            // Limpar formulário
            loginForm.reset();
        } else {
            showError(data.erro || 'Usuário ou senha inválidos');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
        setLoading(false);
    }
}

// Mostrar perfil do usuário
function showProfile(data) {
    // Esconder seção de login
    loginSection.style.display = 'none';
    
    // Preencher dados do perfil
    document.getElementById('profileName').textContent = data.nome || '-';
    document.getElementById('profileUsername').textContent = data.login || '-';
    
    // Formatar data de login
    const loginDate = new Date(data.login_em);
    document.getElementById('loginTime').textContent = loginDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Mostrar ID da sessão
    document.getElementById('sessionId').textContent = data.session_id || getCookie('sessao_id') || '-';
    
    // Mostrar servidor atual
    document.getElementById('currentServer').textContent = serverNameEl.textContent;
    
    // Mostrar seção de perfil com animação
    profileSection.classList.add('show');
}

// Logout
async function logout() {
    console.log('🚪 Iniciando logout...');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        console.log('📡 Resposta do logout:', response.status);
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
    }

    // Limpar cookie (FORÇADO)
    document.cookie = 'sessao_id=; path=/; max-age=0; domain=.synbalance.com.br';
    document.cookie = 'sessao_id=; path=/; max-age=0';
    
    console.log('🍪 Cookies após limpar:', document.cookie);
    
    // Esconder perfil
    profileSection.classList.remove('show');
    
    // Mostrar login
    setTimeout(() => {
        loginSection.style.display = 'block';
    }, 300);
    
    // Limpar campos
    loginForm.reset();
    
    console.log('✅ Logout concluído!');
}

// Definir estado de carregamento
function setLoading(loading) {
    submitBtn.classList.toggle('loading', loading);
    submitBtn.disabled = loading;
    usernameInput.disabled = loading;
    passwordInput.disabled = loading;
}

// Mostrar mensagem de erro
function showError(message) {
    alert(message);
}

// Função auxiliar para ler cookies
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}

// Expor função de logout globalmente (para onclick no HTML)
window.logout = logout;