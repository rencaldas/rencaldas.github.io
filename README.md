<div align="center">

# Renato de Azevedo Caldas | Portfolio

### Portfólio profissional para apresentar minha trajetória, experiência e projetos em desenvolvimento de software, cloud computing, automação e integrações empresariais.

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Online-2EA043?style=for-the-badge&logo=github&logoColor=white)](https://rencaldas.github.io)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)

</div>

---

# 📖 Sobre

Este repositório contém o código-fonte do meu portfólio profissional hospedado no **GitHub Pages**.

O objetivo do projeto é apresentar minha experiência, competências técnicas e principais projetos desenvolvidos na área de Tecnologia da Informação de maneira moderna, rápida e totalmente responsiva.

O site funciona como uma vitrine profissional, reunindo informações sobre:

- minha carreira;
- tecnologias utilizadas;
- experiências profissionais;
- projetos em destaque;
- objetivos de carreira;
- formas de contato.

Além disso, o projeto foi desenvolvido priorizando simplicidade, desempenho e excelente experiência do usuário.

---

# 🎯 Objetivos

Este portfólio foi criado para:

- apresentar meu perfil profissional;
- divulgar projetos públicos do GitHub;
- servir como currículo online;
- facilitar contato com recrutadores e empresas;
- centralizar minhas principais informações profissionais.

---

# ✨ Funcionalidades

- Landing page com tema claro/escuro persistente, respeitando a preferência do sistema
- Layout responsivo de 390px a telas largas
- Animações de entrada por `IntersectionObserver` (sem dependência externa)
- Capturas reais dos projetos apresentadas em moldura de navegador
- Contador de estrelas dos repositórios, atualizado pela API do GitHub com os números do HTML como fallback
- Estudo de caso dedicado do Seslock Holmes, bilíngue PT/EN
- Gráfico de resultados acessível: paleta segura para daltonismo, hachura e rótulos numéricos
- Formulário de contato com validação por campo, antispam (honeypot) e fallback para e-mail
- Timeline profissional e grid bento de stack
- Contraste WCAG AA em ambos os temas
- SEO com dados estruturados (JSON-LD) e Open Graph com imagem própria
- Zero dependência de runtime: sem framework, sem bundler, sem CDN de JS

---

# 🖥️ Demonstração

Acesse o site:

> **https://rencaldas.github.io**

---

# 🛠 Tecnologias Utilizadas

## Front-end

- HTML5
- CSS3
- JavaScript (Vanilla)

## Design

- Responsive Design
- Flexbox
- CSS Grid
- Google Fonts
- Dark Theme

## Deploy

- GitHub Pages

---

# 📂 Estrutura do Projeto

```
.
│
├── assets/
│   ├── css/
│   │   ├── styles.css          # design system e páginas
│   │   └── case-study.css      # estilos do estudo de caso
│   ├── img/
│   │   ├── profile.webp        # retrato usado no hero
│   │   ├── logo.webp           # monograma da marca
│   │   ├── og-cover.png        # imagem de compartilhamento
│   │   └── projects/           # capturas reais dos projetos
│   └── js/
│       └── script.js
│
├── seslock-holmes/
│   └── index.html              # estudo de caso bilíngue PT/EN
│
├── index.html
│
└── README.md
```

---

# 📌 Seções do Site

## 👨 Sobre

Apresentação pessoal e visão profissional.

---

## ⚙ Stack

Lista das tecnologias e ferramentas utilizadas no dia a dia.

Exemplos:

- Python
- JavaScript
- SQL
- Django
- Laravel
- Docker
- AWS
- Oracle Cloud
- PostgreSQL
- MySQL
- Oracle Database
- Git
- GitHub
- Power BI
- n8n
- Sankhya ERP
- SAP GUI
- GLPI

---

## 🚀 Projetos

Em destaque, com captura de tela real:

| Projeto | Stack | Imagem |
|---|---|---|
| [seslock-holmes](https://github.com/rencaldas/seslock-holmes) | TypeScript, React, Supabase, AWS SES | Central de ajuda do app no ar |
| [liac-club](https://github.com/rencaldas/liac-club) | TypeScript, React, Supabase, Deno | Home do site no ar |
| [projeto-alfredos](https://github.com/rencaldas/projeto-alfredos) | Node.js, GitHub Actions, Telegram, Gemini | Conversa real com o bot no Telegram |

Demais repositórios listados: `simulador_filas_estocasticas` (com um gráfico gerado pela própria
simulação), `api-rencaldas`, `projeto_extensao_vi`, `Workspace---Python`, `LabSoftwareA2`,
`projeto-discover` e este repositório.

> As capturas ficam em `assets/img/projects/`. Para atualizar uma delas, substitua o `.webp`
> correspondente mantendo o nome e ajuste `width`/`height` da `<img>` no `index.html`. As imagens
> aparecem na proporção original; a única recortada é a do Telegram, que é vertical e usa a classe
> `is-cropped`.

---

## 💼 Experiência

Histórico profissional com principais responsabilidades e resultados obtidos.

---

## 🎯 Estudos Atuais

Tecnologias em desenvolvimento contínuo:

- AWS Solutions Architect
- Docker
- Kubernetes
- Terraform
- CI/CD
- Clean Architecture
- Platform Engineering
- Inteligência Artificial
- LLMs

---

# 📱 Responsividade

O projeto foi desenvolvido para funcionar corretamente em:

- Desktop
- Notebook
- Tablet
- Smartphone

---

# ⚡ Performance

O projeto prioriza:

- carregamento rápido;
- poucas dependências externas;
- código limpo;
- alta compatibilidade entre navegadores.

---

# 🚀 Como executar localmente

Clone o projeto:

```bash
git clone https://github.com/rencaldas/rencaldas.github.io.git
```

Entre na pasta:

```bash
cd rencaldas.github.io
```

Abra o arquivo:

```
index.html
```

ou utilize uma extensão como **Live Server** no VSCode.

---

# 🌎 Deploy

O deploy é realizado através do **GitHub Pages**.

Sempre que alterações são enviadas para a branch principal, o site é atualizado automaticamente.

---

# ⚙️ Configuração do formulário de contato

O formulário usa o [Web3Forms](https://web3forms.com) para entregar as mensagens direto no e-mail,
sem backend próprio. Enquanto a chave não estiver preenchida, o formulário continua funcionando:
ele valida os campos e abre o cliente de e-mail do visitante com a mensagem pronta.

Para ativar o envio direto:

1. Pegue uma chave gratuita em https://web3forms.com (basta informar o e-mail de destino).
2. Em `index.html`, preencha o `value` do campo:

```html
<input type="hidden" name="access_key" value="SUA_CHAVE_AQUI" data-access-key />
```

O campo `botcheck` é o honeypot: fica fora da tela, escondido de leitores de tela e da ordem de
tabulação. Se vier preenchido, o envio é descartado sem chamar a rede.

---

# 📈 Próximas melhorias

- [x] Página individual para projetos (estudo de caso do Seslock Holmes)
- [x] Formulário de contato
- [x] Modo claro
- [ ] Sistema multilíngue (PT/EN) no site inteiro — hoje só no estudo de caso
- [ ] Instância de demonstração do Seslock Holmes com dados de exemplo
- [ ] Currículo em PDF gerado a partir da folha de impressão do site
- [ ] Integração com GitHub API e estatísticas automáticas
- [ ] Certificações
- [ ] Domínio próprio

---

# 🤝 Contribuições

Embora seja um projeto de portfólio pessoal, sugestões de melhoria são sempre bem-vindas.

Caso encontre algum problema ou tenha alguma ideia, fique à vontade para abrir uma Issue ou enviar um Pull Request.

---

# 📬 Contato

**Renato de Azevedo Caldas**

- LinkedIn: https://linkedin.com/in/rencaldas
- GitHub: https://github.com/rencaldas

---

# 📄 Licença

Este projeto está licenciado sob a licença MIT.

Consulte o arquivo **LICENSE** para mais informações.

---

<div align="center">

### Desenvolvido por Renato de Azevedo Caldas

Cloud • Backend • Automação • DevOps • Integrações Empresariais

⭐ Se este projeto foi útil, considere deixar uma estrela no repositório.

</div>
