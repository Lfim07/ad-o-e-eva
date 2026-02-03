# 🐍 Snake adão e Eva – Web

Um jogo clássico da cobrinha desenvolvido com **HTML, CSS e JavaScript puro**, com foco em código limpo, performance e experiência do usuário — desktop e mobile.

---

## 🎮 Demonstração
> Jogo executado diretamente no navegador, sem bibliotecas externas.

---

## 🚀 Funcionalidades

- ✅ Movimento clássico da cobrinha
- ✅ Aceleração progressiva conforme a pontuação
- ✅ Comida com animação
- ✅ Efeitos sonoros sincronizados
- ✅ Ranking salvo no `localStorage`
- ✅ Suporte total para mobile (gestos touch)
- ✅ Temas visuais (Default / Neon / Retrô)
- ✅ HUD flutuante com efeito glassmorphism
- ✅ Animação de Game Over

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** — Estrutura do jogo
- **CSS3** — Estilização, temas, animações e responsividade
- **JavaScript (Vanilla)** — Lógica do jogo e controle de estados

> Nenhuma biblioteca externa foi utilizada.

---

## 📱 Compatibilidade

- ✔ Desktop (teclado)
- ✔ Mobile (toque / swipe)
- ✔ Navegadores modernos (Chrome, Edge, Firefox)

---

## 🧠 Lógica do Jogo

- O tabuleiro é um grid 20x20
- A cobrinha é representada por um array de posições
- A cada frame:
  - A cabeça avança
  - O corpo segue
  - Colisões são verificadas
- Ao comer a comida:
  - Pontuação aumenta
  - Velocidade do jogo aumenta
  - Nova comida é gerada
- Ao colidir:
  - O jogo termina
  - Ranking é atualizado

---

## 🏆 Ranking

O maior recorde é salvo automaticamente no navegador usando:

```js
localStorage.setItem('highScore', score);
