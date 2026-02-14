🐍 Snake: Adão e Eva — Experiência Narrativa Interativa

Um jogo inspirado no clássico Snake, reimaginado como uma experiência narrativa progressiva, com trilha sonora dinâmica, eventos especiais e evolução de dificuldade baseada na performance do jogador.

Desenvolvido com HTML5, CSS3 e JavaScript puro (Vanilla JS) — sem bibliotecas externas.

🎮 Conceito

A serpente atravessa três estágios simbólicos:

🌿 Éden — Harmonia, ritmo controlado

🍎 Tentação — Velocidade crescente e tensão

🔥 Queda — Intensidade máxima

A cada fase:

O ambiente muda

A velocidade aumenta

A música evolui

A tensão cresce

Não é apenas um jogo da cobrinha.
É progressão narrativa baseada em desempenho.

🚀 Funcionalidades

✅ Movimento fluido com requestAnimationFrame

✅ Sistema de capítulos desbloqueados por pontuação

✅ Trilha sonora dinâmica com fade in/out automático

✅ Sistema de congelamento temporário (evento especial)

✅ Alteração dinâmica de velocidade

✅ HUD interativo com mensagens narrativas

✅ Sistema de pausa

✅ Ranking salvo no localStorage

✅ Mensagens aleatórias de Game Over

✅ Mudança visual de tema por fase

🛠️ Tecnologias Utilizadas

HTML5 — Estrutura do jogo

CSS3 — Estilização, temas e transições

JavaScript (Vanilla) — Lógica, controle de estados e game loop

Projeto 100% JavaScript puro.

⚙️ Arquitetura Técnica
🎯 Game Loop Moderno

Utiliza requestAnimationFrame com cálculo de tempo (deltaTime) para manter estabilidade independente do FPS.

🧠 Controle de Estado

Gerenciamento de:

running

paused

frozen

capítulo atual

música ativa

🎵 Sistema de Música Adaptativa

3 trilhas distintas

Troca automática baseada na pontuação

Transições suaves com fade progressivo

❄ Evento Especial

A cada múltiplo de 5 pontos:

A serpente pode congelar por 10 segundos

A velocidade pode variar temporariamente

📊 Lógica do Jogo

Grid 20x20

Cobra representada por array de posições

Detecção de colisão com:

Parede

Próprio corpo

Progressão automática de dificuldade

Mudança de tema via atributo data-theme

💾 Persistência de Dados

O recorde é salvo automaticamente no navegador:

localStorage.setItem('highScore', highScore);

Sem banco externo.
Sem servidor.
Tudo roda localmente.

📱 Compatibilidade

✔ Desktop (teclado)

✔ Navegadores modernos (Chrome, Edge, Firefox)

✔ Funciona offline após carregamento

🎨 Diferenciais

Este projeto vai além de um clone tradicional de Snake:

Narrativa integrada ao gameplay

Trilha sonora reativa

Eventos inesperados

Mudança de atmosfera sem troca de tela

Estrutura organizada para expansão futura

Ideal como projeto de portfólio front-end focado em lógica, performance e experiência do usuário.

🔮 Próximas Evoluções Possíveis

Sistema de chefes

Obstáculos dinâmicos

Ranking online

Modo infinito

Sistema de conquistas

Versão mobile otimizada com swipe

Efeitos visuais com partículas

👨‍💻 Autor

Projeto desenvolvido como estudo avançado de:

Game loop

Controle de estado

Performance em JavaScript

Experiência narrativa interativa