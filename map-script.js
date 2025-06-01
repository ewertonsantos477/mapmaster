// O código JavaScript do mapa será copiado para este arquivo
// (É o mesmo conteúdo do bloco <script> que estava dentro do seu HTML do mapa)

let map;
let pontosRota = [];
let rotaLayer;
let rotas = [];
let marcadores = [];

// Ícones customizados
const icones = {
    'Polícia': L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/1531/1531870.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    }),
    'Radar': L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/625/625796.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    }),
    'Buraco': L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/565/565099.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    }),
    'Semáforo': L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    }),
};

function toggleMenu() {
    const menu = document.getElementById('actionMenu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

function mostrarRotas() {
    const lista = document.getElementById('listaRotas');
    lista.style.display = lista.style.display === 'block' ? 'none' : 'block';
    document.getElementById('listaMarcadores').style.display = 'none';
    atualizarListaRotas();
}

function atualizarListaRotas() {
    const ul = document.getElementById('rotasUl');
    ul.innerHTML = '';
    const filtro = document.getElementById('filtroRotas').value.toLowerCase();
    rotas.forEach((rota, index) => {
        if (rota.nome.toLowerCase().includes(filtro)) {
            const li = document.createElement('li');
            const nomeSpan = document.createElement('span');
            nomeSpan.innerText = rota.nome;
            nomeSpan.style.cursor = 'pointer';
            nomeSpan.onclick = () => {
                map.fitBounds(rota.layer.getBounds());
            };

            const btnEditar = document.createElement('button');
            btnEditar.innerText = '✏️';
            btnEditar.title = "Editar rota";
            btnEditar.onclick = (e) => {
                e.stopPropagation();
                editarRota(index);
            };

            const btnExcluir = document.createElement('button');
            btnExcluir.innerText = '🗑️';
            btnExcluir.title = "Excluir rota";
            btnExcluir.onclick = (e) => {
                e.stopPropagation();
                excluirRota(index);
            };

            li.appendChild(nomeSpan);
            li.appendChild(btnEditar);
            li.appendChild(btnExcluir);
            ul.appendChild(li);
        }
    });
}

function filtrarRotas() {
    atualizarListaRotas();
}

function mostrarMarcadores() {
    const lista = document.getElementById('listaMarcadores');
    lista.style.display = lista.style.display === 'block' ? 'none' : 'block';
    document.getElementById('listaRotas').style.display = 'none';
    atualizarListaMarcadores();
}

function atualizarListaMarcadores() {
    const ul = document.getElementById('marcadoresUl');
    ul.innerHTML = '';
    const filtro = document.getElementById('filtroMarcadores').value.toLowerCase();
    marcadores.forEach((m, index) => {
        if (m.tipo.toLowerCase().includes(filtro)) {
            const li = document.createElement('li');
            const nomeSpan = document.createElement('span');
            nomeSpan.innerText = `${m.tipo} (${m.marker.getLatLng().lat.toFixed(4)}, ${m.marker.getLatLng().lng.toFixed(4)})`;
            nomeSpan.style.cursor = 'pointer';
            nomeSpan.onclick = () => {
                map.panTo(m.marker.getLatLng());
                m.marker.openPopup();
            };

            const btnExcluir = document.createElement('button');
            btnExcluir.innerText = '🗑️';
            btnExcluir.title = "Excluir marcador";
            btnExcluir.onclick = (e) => {
                e.stopPropagation();
                excluirMarcador(index);
            };

            li.appendChild(nomeSpan);
            li.appendChild(btnExcluir);
            ul.appendChild(li);
        }
    });
}

function filtrarMarcadores() {
    atualizarListaMarcadores();
}

function adicionarMarcador(tipo) {
    if (!icones[tipo]) {
        alert("Tipo de marcador inválido");
        return;
    }
    const center = map.getCenter();
    const marker = L.marker(center, { icon: icones[tipo] }).addTo(map).bindPopup(tipo);
    marcadores.push({ tipo, marker });
    atualizarListaMarcadores();
    toggleMenu();
    salvarDados(); // <--- CHAMADA DE SALVAR DADOS
}

function excluirMarcador(index) {
    const m = marcadores[index];
    if (m && m.marker) {
        map.removeLayer(m.marker);
    }
    marcadores.splice(index, 1);
    atualizarListaMarcadores();
    salvarDados(); // <--- CHAMADA DE SALVAR DADOS
}

let rotaEditandoIndex = null;

function iniciarRota() {
    pontosRota = [];
    if (rotaLayer) {
        map.removeLayer(rotaLayer);
        rotaLayer = null;
    }
    document.getElementById('rotaControls').style.display = 'block';
    document.getElementById('nomeRota').value = '';
    document.getElementById('corRota').value = '#0000ff';
    toggleMenu();
    rotaEditandoIndex = null; // Reinicia o índice de edição
}

function adicionarPontoRota() {
    const center = map.getCenter();
    pontosRota.push(center);
    desenharRota();
}

function removerUltimoPonto() {
    pontosRota.pop();
    desenharRota();
}

function desenharRota() {
    if (rotaLayer) {
        map.removeLayer(rotaLayer);
    }
    if (pontosRota.length > 1) {
        rotaLayer = L.polyline(pontosRota, { color: document.getElementById('corRota').value }).addTo(map);
    }
}

function salvarRota() {
    const nome = document.getElementById('nomeRota').value.trim();
    if (!nome) {
        alert('Informe o nome da rota');
        return;
    }
    if (pontosRota.length < 2) {
        alert('Adicione pelo menos dois pontos para salvar a rota');
        return;
    }
    // Se estiver editando rota, atualizar, senão criar nova
    if (rotaEditandoIndex !== null) {
        // Remove camada antiga
        map.removeLayer(rotas[rotaEditandoIndex].layer);
        rotas[rotaEditandoIndex] = {
            nome,
            pontos: pontosRota.slice(),
            cor: document.getElementById('corRota').value,
            layer: L.polyline(pontosRota, { color: document.getElementById('corRota').value }).addTo(map)
        };
        rotaEditandoIndex = null;
    } else {
        const novaRota = {
            nome,
            pontos: pontosRota.slice(),
            cor: document.getElementById('corRota').value,
            layer: L.polyline(pontosRota, { color: document.getElementById('corRota').value }).addTo(map)
        };
        rotas.push(novaRota);
    }
    pontosRota = [];
    document.getElementById('rotaControls').style.display = 'none';
    atualizarListaRotas();
    salvarDados(); // <--- CHAMADA DE SALVAR DADOS
}

function editarRota(index) {
    rotaEditandoIndex = index;
    const rota = rotas[index];
    pontosRota = rota.pontos.slice();
    if (rotaLayer) {
        map.removeLayer(rotaLayer);
    }
    rotaLayer = L.polyline(pontosRota, { color: rota.cor }).addTo(map);
    document.getElementById('rotaControls').style.display = 'block';
    document.getElementById('nomeRota').value = rota.nome;
    document.getElementById('corRota').value = rota.cor;
    toggleMenu();
    // Não chame salvarDados aqui, pois estamos apenas carregando para edição, não salvando.
}

function excluirRota(index) {
    map.removeLayer(rotas[index].layer);
    rotas.splice(index, 1);
    atualizarListaRotas();
    salvarDados(); // <--- CHAMADA DE SALVAR DADOS
}

function adicionarNomeRua() {
    const nome = prompt("Nome da rua:");
    if (nome) {
        const center = map.getCenter();
        L.marker(center).addTo(map).bindPopup(nome).openPopup();
        // Poderíamos salvar nomes de ruas aqui se quiséssemos persistir
        // salvarDados();
    }
}

let marcadorGPS = null;

function iniciarMapa() {
    map = L.map('map').setView([-15.7942, -47.8822], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let usuarioInteragiu = false;

    map.on("dragstart zoomstart", () => {
        usuarioInteragiu = true;
    });

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const velocidade = pos.coords.speed ? (pos.coords.speed * 3.6).toFixed(1) : 0;
                document.getElementById('velocidade').innerText = `Vel: ${velocidade} km/h`;

                if (!marcadorGPS) {
                    marcadorGPS = L.marker([lat, lng], {
                        icon: L.icon({
                            iconUrl: 'https://cdn-icons-png.flaticon.com/512/4870/4870243.png',
                            iconSize: [35, 35],
                            iconAnchor: [17, 35],
                        })
                    }).addTo(map).bindPopup("Você está aqui!").openPopup();
                } else {
                    marcadorGPS.setLatLng([lat, lng]);
                }

                if (!usuarioInteragiu) {
                    map.setView([lat, lng], map.getZoom());
                }
            },
            (err) => {
                console.error("Erro no GPS: ", err);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
    }

    const geocoder = L.Control.geocoder({
        defaultMarkGeocode: false
    })
    .on('markgeocode', function(e) {
        const bbox = e.geocode.bbox;
        const poly = L.polygon([
            bbox.getSouthEast(),
            bbox.getNorthEast(),
            bbox.getNorthWest(),
            bbox.getSouthWest()
        ]);
        map.fitBounds(poly.getBounds());
    })
    .addTo(map);

    carregarDados(); // <--- CHAMADA DE CARREGAR DADOS AO INICIAR O MAPA
}

function localizarUsuario() {
    if (!navigator.geolocation) {
        alert("Geolocalização não é suportada por este navegador.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 16);
            if (!marcadorGPS) {
                marcadorGPS = L.marker([lat, lng], {
                    icon: L.icon({
                        iconUrl: 'https://cdn-icons-png.flaticon.com/512/4870/4870243.png',
                        iconSize: [35, 35],
                        iconAnchor: [17, 35],
                    })
                }).addTo(map).bindPopup("Você está aqui!").openPopup();
            } else {
                marcadorGPS.setLatLng([lat, lng]);
                marcadorGPS.openPopup();
            }
        },
        (error) => {
            alert("Erro ao obter localização: " + error.message);
        }
    );
}

// --- Funções de Salvar e Carregar Dados ---
function salvarDados() {
    // Prepara as rotas para salvar (apenas dados necessários, sem o objeto Leaflet 'layer')
    const rotasParaSalvar = rotas.map(rota => ({
        nome: rota.nome,
        pontos: rota.pontos,
        cor: rota.cor
    }));
    localStorage.setItem('rotasMapa', JSON.stringify(rotasParaSalvar));

    // Prepara os marcadores para salvar (apenas dados necessários, sem o objeto Leaflet 'marker')
    const marcadoresParaSalvar = marcadores.map(m => ({
        tipo: m.tipo,
        latlng: m.marker.getLatLng() // Salva a latitude e longitude do marcador
    }));
    localStorage.setItem('marcadoresMapa', JSON.stringify(marcadoresParaSalvar));
    console.log("Dados salvos automaticamente!");
}

function carregarDados() {
    const rotasSalvas = JSON.parse(localStorage.getItem('rotasMapa') || '[]');
    rotas = rotasSalvas.map(rota => {
        const polyline = L.polyline(rota.pontos, { color: rota.cor }).addTo(map);
        return {
            nome: rota.nome,
            pontos: rota.pontos,
            cor: rota.cor,
            layer: polyline
        };
    });
    atualizarListaRotas(); // Atualiza a lista exibida na UI

    const marcadoresSalvos = JSON.parse(localStorage.getItem('marcadoresMapa') || '[]');
    marcadores = marcadoresSalvos.map(m => {
        const marker = L.marker(m.latlng, { icon: icones[m.tipo] }).addTo(map).bindPopup(m.tipo);
        return {
            tipo: m.tipo,
            marker: marker
        };
    });
    atualizarListaMarcadores(); // Atualiza a lista exibida na UI
    console.log("Dados carregados automaticamente!");
}

document.getElementById("map").style.display = "block";
iniciarMapa();