# 🌐 PROJETO: CYBERSTEAM (Codinome)
> **Status:** Concepção de Arquitetura e MVP (Fase 1)  
> **Autor:** [Seu Nome] & Gemini (Co-Piloto)  
> **Propósito:** Transformar dados brutos da Steam em uma vitrine de ostentação digital ultra-estética, futurista e altamente customizável.

---

## 1. Manifesto e Visão Geral
Este projeto é uma plataforma SaaS (Software as a Service) voltada para a comunidade gamer entusiasta, colecionadores de perfis de alto nível da Steam e comunidades estéticas do Discord (Gótico, Cyberpunk, Vaporwave, Cute/Anime). 

A premissa é simples, mas ambiciosa: **A Steam oferece dados; nós oferecemos status e arte.** 

Diferente de plataformas analíticas tradicionais (como SteamDB ou SteamLadder), que focam em tabelas e gráficos frios, o CYBERSTEAM funciona como o "Spotify" da identidade gamer. O usuário realiza o login via Steam OpenID e a plataforma renderiza instantaneamente um microsite dinâmico, responsivo, com animações fluidas em CSS/JS, efeitos neon, partículas e visual "glitch". O link gerado (ex: `cybersteam.com/leahn`) serve como o cartão de visitas definitivo para ser exibido na bio do Discord, TikTok, Instagram ou no próprio perfil da Steam.

---

## 2. Pilares de Core Design & Experiência do Usuário (UX)
*   **Integração em Tempo Real:** Nada de dados estáticos. Foto de perfil, nível, jogos recentes e status online devem atualizar dinamicamente via Steam API.
*   **Fluidez e Impacto Visual:** Animações de interface que dão a sensação de estar operando um terminal de inteligência artificial ou um deck hacker (Cyberpunk 2077 / Ghost in the Shell).
*   **Foco no Público Premium:** Valorização extrema de artes de perfil recortadas, coordenação de cores (paletas perfeitas) e exibição orgânica de conquistas raras.

---

## 3. Modelo de Negócio e Escalaridade (Estratégia Freemium)

O projeto escalará sem a necessidade de intervenção manual após a base estar sólida, utilizando um modelo de assinatura ou pagamento único para recursos estéticos avançados.

*   **Camada Gratuita (Free):**
    *   Login seguro via Steam.
    *   Geração da página com URL própria (`/user/nickname`).
    *   Tema padrão "Cyberpunk Base" (Cores fixas, layout padrão).
    *   Exibição básica de nível, avatar e horas de jogo.
*   **Camada Premium (CyberClub - Assinatura ou Taxa Única):**
    *   **Temas Avançados:** Liberação de estilos visuais (Gótico/Dark Minimalist, Vaporwave Neon, Kawaii/Anime).
    *   **Customização Total:** Escolha de paletas de cores hexadecimais para botões, bordas do avatar e textos.
    *   **Efeitos de Partículas:** Chuva digital (estilo Matrix), fumaça, neon pulsante ou faíscas em movimento ao fundo.
    *   **Música & Integração:** Player com integração ao Spotify para mostrar em tempo real o que o usuário está ouvindo enquanto visitam seu perfil.
    *   **Subdomínio/URL Customizada:** Ex: `vip.cybersteam.com/nickname`.

---

## 4. Stack Tecnológica Sugerida (A Melhor para Performance e Escala)

Para garantir que o site seja extremamente rápido, lindo e fácil de linkar com o Replit e o GitHub, usaremos uma arquitetura moderna baseada em JavaScript/TypeScript.

*   **Frontend (Interface e Animações):**
    *   **Framework:** **Next.js (React)** ou **Vite + React**. (Optaremos por Vite + React para a base rápida no Replit, permitindo SPA de alta performance).
    *   **Estilização:** **Tailwind CSS** (para estilização rápida e responsiva) combinada com **Framer Motion** (essencial para as animações fluidas, transições de fade, efeitos de glitch e carregamento cyberpunk).
*   **Backend (Processamento e APIs):**
    *   **Ambiente:** **Node.js** com **Express** (ou rotas nativas do Next.js se optarmos por ele).
    *   **Autenticação:** `passport-steam` (Biblioteca padrão de mercado para realizar o login seguro via OpenID da Steam de forma limpa).
    *   **Consumo de Dados:** Integração direta com a **Steam Web API** usando Axios/Fetch.
*   **Infraestrutura & Deploy:**
    *   **Repositório:** GitHub (Controle de versão).
    *   **Ambiente de Dev:** Replit (Para codarmos juntos em tempo real e deploy rápido).

---

## 5. Roadmap de Desenvolvimento (O Plano de Ação)

*   **Fase 1: A Base (O que faremos a seguir):**
    1. Instalação do ambiente e estrutura de pastas no VS Code / Replit.
    2. Criação do servidor Node.js básico para autenticação com a Steam.
    3. Consumo inicial da API da Steam para puxar a foto de perfil (`avatar`), nível (`playerLevel`) e o nickname.
*   **Fase 2: O Visual Insano (Frontend):**
    1. Construção da interface com Tailwind baseada nos exemplos visuais de alta estética (recortes limpos, contraste escuro).
    2. Implementação das animações de entrada com Framer Motion.
*   **Fase 3: Customização e Banco de Dados:**
    1. Integração de um banco de dados leve (MongoDB ou PostgreSQL) para salvar qual tema o usuário escolheu para o link dele.
*   **Fase 4: Lançamento e Marketing de Comunidade:**
    1. Divulgação focada em servidores de estética do Discord e parcerias com micro-influenciadoras gamers de PC, utilizando o marketing orgânico de compartilhamento de link.

---
