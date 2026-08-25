# Análise SST — Versão Web

Versão web do Analisador Técnico de PGR/PCMSO/LTCAT. Roda num navegador,
acessível por link, com login por senha compartilhada da equipe.

## Como funciona

- A chave da API do Gemini fica **só no servidor** (variável de ambiente),
  nunca aparece pro navegador — diferente da versão desktop, aqui ninguém
  da equipe precisa ter a própria chave.
- Acesso protegido por uma **senha única compartilhada** (defina o quanto
  quiser, todo mundo da equipe usa a mesma pra entrar).
- Mesmas funcionalidades da versão desktop: análise técnica com contexto e
  fotos, e formatação de documento (incluindo padrão ABNT).

## Passo a passo pra colocar no ar (gratuito, via Render.com)

### 1. Criar uma chave da API do Gemini (se ainda não tiver)
Acesse [aistudio.google.com/apikey](https://aistudio.google.com/apikey) e
gere uma chave — tem cota gratuita, não precisa de cartão.

### 2. Colocar o código no GitHub
O Render precisa puxar o código de um repositório. Se você não tem conta
no GitHub:
1. Crie uma conta grátis em [github.com](https://github.com)
2. Crie um repositório novo (pode ser privado)
3. Suba a pasta `webapp` inteira pra esse repositório (dá pra fazer
   arrastando os arquivos direto pela interface do GitHub, sem precisar
   saber usar Git por linha de comando)

### 3. Criar conta no Render e conectar o repositório
1. Acesse [render.com](https://render.com) e crie uma conta (dá pra usar
   login do GitHub direto, facilita)
2. Clique em **New +** → **Web Service**
3. Selecione o repositório que você acabou de criar
4. O Render vai detectar o arquivo `render.yaml` automaticamente e sugerir
   a configuração (plano Free, comando de start etc.) — só confirmar

### 4. Configurar as variáveis de ambiente (segredos)
Na tela de configuração do serviço no Render, em **Environment**, adicione:
| Nome | Valor |
|---|---|
| `GEMINI_API_KEY` | a chave que você gerou no passo 1 |
| `APP_PASSWORD` | a senha que a equipe vai usar pra entrar no site |

(`SECRET_KEY` já é gerada automaticamente pelo Render por causa do `render.yaml`)

### 5. Deploy
Clique em **Create Web Service**. O Render vai instalar as dependências e
subir o site — leva uns 2-5 minutos na primeira vez. Quando terminar, você
recebe uma URL tipo `https://analise-sst.onrender.com` — esse é o link que
você compartilha com a equipe.

## Sobre o plano gratuito do Render

- O serviço **"dorme" depois de ficar uns 15 minutos sem uso**. A próxima
  pessoa que acessar espera uns 30-50 segundos pra ele "acordar" — é
  normal, não é erro.
- Tem limite de horas gratuitas por mês, mas pra uso de uma equipe pequena
  costuma ser suficiente.
- Se isso incomodar no dia a dia, dá pra migrar pro plano pago (a partir
  de uns 7 dólares/mês) que mantém o serviço sempre acordado — mas comece
  no grátis e veja se atende.

## Rodando localmente pra testar antes de publicar

```bash
cd webapp
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

set GEMINI_API_KEY=sua_chave_aqui
set APP_PASSWORD=senha_teste
python app.py
```
Acesse `http://localhost:5000` no navegador.

## Limitações desta versão

- Login é uma senha única pra todo mundo — não dá pra saber quem fez qual
  análise nem revogar acesso de uma pessoa específica sem trocar a senha
  de todos. Se isso for importante, dá pra evoluir pra login individual.
- Arquivos grandes (documentos extensos + muitas fotos) podem demorar mais
  no plano gratuito, que tem menos memória/CPU que um servidor pago.
- Assim como na versão desktop, a IA pode não ter as atualizações mais
  recentes de legislação — confira manualmente antes de usar em documento
  oficial.

## Essa versão substitui o app desktop?

Não precisa — são independentes. O app desktop (`AnalistaSST.exe`) continua
funcionando offline com sua própria chave. Essa versão web é útil quando
vários da equipe precisam acessar de lugares diferentes sem instalar nada.
