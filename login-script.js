// Função para pegar usuários do localStorage (objeto: email -> senha)
function getUsuarios() {
    const usuarios = localStorage.getItem('usuarios');
    return usuarios ? JSON.parse(usuarios) : {};
}

// Salva usuários no localStorage
function salvarUsuarios(usuarios) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

document.addEventListener('DOMContentLoaded', () => {
    // Lógica para o formulário de Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            const email = document.getElementById('emailInput').value.trim();
            const password = document.getElementById('passwordInput').value.trim();

            if (email === '' || password === '') {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            const usuarios = getUsuarios();

            if (usuarios[email]) {
                if (usuarios[email] === password) {
                    alert(`Login realizado com sucesso!\nBem-vindo, ${email}!`);
                    // Redirecionar para a página do mapa após o login bem-sucedido
                    window.location.href = 'index.html'; // Redireciona para o mapa
                } else {
                    alert('Senha incorreta.');
                }
            } else {
                alert('Usuário não cadastrado. Por favor, cadastre-se.');
            }
        });
    }

    // Lógica para o formulário de Cadastro
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('emailCadastro').value.trim();
            const password = document.getElementById('passwordCadastro').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();

            if (nome === '' || email === '' || password === '' || confirmPassword === '') {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            if (password !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }

            const usuarios = getUsuarios();

            if (usuarios[email]) {
                alert('Este email já está cadastrado. Tente fazer login.');
            } else {
                usuarios[email] = password; // Salvando apenas email e senha
                salvarUsuarios(usuarios);
                alert(`Cadastro realizado com sucesso!\nBem-vindo(a), ${nome}!\nAgora faça login.`);
                // Redireciona para a tela de login após o cadastro
                window.location.href = 'login.html';
            }
        });
    }
});


// Funções para os botões sociais (apenas simulação)
function loginGoogle() {
    alert('Continuar com Google (funcionalidade a ser implementada).');
    // Em um cenário real, você integraria a API de login do Google aqui.
}

function loginFacebook() {
    alert('Continuar com Facebook (funcionalidade a ser implementada).');
    // Em um cenário real, você integraria a API de login do Facebook aqui.
}

// Função para "Forgot password?"
function forgotPassword() {
    const email = prompt("Por favor, digite seu email para redefinir a senha:");
    if (email) {
        const usuarios = getUsuarios();
        if (usuarios[email]) {
            alert(`Um email para recuperação de senha foi enviado para ${email} (simulado).`);
            // Em um cenário real, você enviaria uma solicitação ao servidor para redefinir a senha.
        } else {
            alert('Email não cadastrado.');
        }
    }
}