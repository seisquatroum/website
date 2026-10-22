# Cartões de sócio sem base de dados

## Consultar

- `/socios`: página pública com pesquisa por nome ou número e cartões resumidos, sem quotas, validade ou filtro de quotas.
- `/socios/1`: cartão individual. `/socio/1` e `/socio-1` redirecionam para o mesmo cartão.
- Na página geral, cada cartão mostra apenas número e nome. O cartão individual mostra também quotas e validade após introduzir a Pass.
- É possível imprimir o cartão. O endereço individual pode ser partilhado pelo responsável; o cartão não tem botões para copiar o link ou consultar outros sócios.

## Pedido de palavra-passe

O Excel deve incluir uma coluna `Pass` (também reconhece `Password`, `Palavra-passe` ou `Senha`) preenchida para cada sócio. A ferramenta local gera um verificador PBKDF2-SHA256 com salt aleatório, sem publicar a palavra-passe original. No link individual, a palavra-passe introduzida é comparada com esse verificador antes de mostrar o cartão. A verificação distingue maiúsculas, minúsculas e espaços. Formatar Pass como texto no Excel para preservar zeros iniciais.

O desbloqueio dura apenas enquanto a página estiver aberta. Recarregar, abrir outro cartão ou alterar o verificador volta a pedir a palavra-passe. As palavras-passe não são colocadas no endereço, na impressão nem no armazenamento do navegador. Os cartões sem verificador ficam indisponíveis até serem reimportados com Pass.

**Esta funcionalidade é uma barreira visual, não controlo de acesso seguro.** Os nomes e restantes dados continuam legíveis em `public/socios.json`, e a verificação no navegador pode ser contornada. Não existe cifra dos cartões, autenticação num servidor ou bloqueio real de tentativas. Os verificadores também podem ser descarregados e sujeitos a tentativas fora do site. Para tornar os dados privados é necessário cifrá-los ou usar um serviço privado.

Os dados são públicos, incluindo o ficheiro `public/socios.json`. Não colocar nele contactos, moradas, comprovativos ou outros campos privados. `noindex` desencoraja a indexação dos cartões, mas não é uma restrição de acesso.

## Preparar uma atualização

1. No computador de um responsável com acesso ao projeto, executar `npm install` e `npm run dev` (em PowerShell, usar `npm.cmd`). Requer Node 22.13 ou posterior.
2. Abrir `/gestao` no endereço local mostrado pelo terminal. Esta ferramenta existe apenas em desenvolvimento; não fica acessível no site publicado.
3. Escolher o Excel. O ficheiro é lido no navegador e não é enviado para um servidor.
4. Confirmar folha e colunas. O modelo enviado pela associação reconhece `Nome Completo`, `Estado Quotas`, `Validade` e `Pass` automaticamente.
5. Rever números de sócio, nomes, quotas e validade. A exportação é bloqueada quando há erros.
6. Confirmar os dados públicos e descarregar `socios.json`. Descarregar também a lista numerada CSV quando tenham sido atribuídos números novos.

O ficheiro original não é alterado. A tabela permite editar números nas primeiras 100 linhas. Em listas maiores, acrescentar uma coluna `Número de sócio` no Excel para todos os registos.

A lista numerada CSV não inclui Pass. Se a usares numa importação seguinte, acrescenta a coluna Pass antes de importar; preferencialmente mantém os números no Excel original.

## Números estáveis

O Excel original de respostas não inclui número de sócio. A primeira atribuição tem de ser confirmada pelo responsável. O botão `Atribuir números em falta` começa depois do maior número já usado, preservando correspondências por nome na lista publicada. Nomes ambíguos não recebem um número automaticamente.

Depois da primeira importação, guardar uma coluna `Número de sócio` na lista de trabalho ou usar a lista numerada CSV nas atualizações seguintes. Nunca renumerar os sócios por posição da linha. Uma alteração de nome deve manter o número existente. Pessoas diferentes com o mesmo nome precisam de números explícitos.

## Quotas e validade

- `Pago`, `Paga`, `Em dia` e equivalentes: Pago.
- `Por pagar`, `Não pago`, `Em atraso`, `Pendente`: Por pagar.
- Campo vazio ou `Por confirmar`: Por confirmar.
- `Isento`: Isento.
- Estados desconhecidos bloqueiam a exportação para evitar interpretações silenciosas.

A validade aceita datas de Excel, `dd/mm/aaaa` e `aaaa-mm-dd`. Uma validade vazia aparece como `Por confirmar`. Uma validade passada mostra `Terminada` sem alterar o estado de pagamento do ficheiro. Não são inferidos valores ou períodos pagos a partir de comprovativos.

## Publicar no GitHub Pages

1. Rever o ficheiro gerado. Os sócios omitidos da importação são conservados por número; os números existentes são atualizados.
2. Substituir `public/socios.json` no repositório pelo ficheiro gerado. Não enviar o Excel original.
3. Confirmar a alteração e publicar na branch `main`, pelo fluxo habitual do projeto. Não é necessário alterar código.
4. Aguardar o workflow `Deploy to GitHub Pages` em Actions e verificar `/socios` e os cartões individuais. Confirmar que `/gestao` continua a mostrar página não encontrada.

Só quem tem permissão para alterar o repositório pode publicar. Não existe login fictício nem palavra-passe guardada no frontend. A ferramenta local apenas prepara e descarrega ficheiros; nunca altera o site remoto.

Antes de gerar a atualização seguinte, atualizar o checkout local com a última publicação para que a ferramenta conserve a lista mais recente. Para retirar um cartão, remover explicitamente esse registo de `public/socios.json` e voltar a publicar; a importação nunca apaga por omissão.

## Alternativa por terminal

```powershell
npm.cmd run socios:preparar -- "C:/caminho/inscricoes.xlsx"
```

Se faltarem números e o responsável decidir atribuí-los:

```powershell
npm.cmd run socios:preparar -- "C:/caminho/inscricoes.xlsx" --atribuir-numeros
```

O resultado fica em `.local/socios.json`, fora do Git, para revisão. `--output` permite escolher outro destino. O comando lê a primeira folha e usa as colunas reconhecidas; a interface local permite escolher outras folhas e colunas.

## Verificação

`npm run socios:testar` testa importação, validação, datas, privacidade e estabilidade de números. `npm run socios:validar` verifica o ficheiro público e rejeita campos privados ou duplicados. A mesma validação corre automaticamente antes dos builds normais e do GitHub Pages.
