/* O MODELO PARA JUNTAR OS FORMANDOS.
   Descarrega-se no Repo, preenche-se no Excel e volta a carregar-se.

   UMA LINHA = UMA PESSOA NUMA FORMAÇÃO. É assim que os dados chegam:
   copia-se a lista de uma página de curso e cola-se. Quem fez três
   formações aparece em três linhas, e isso está certo - o Repo junta-as
   pelo email e mostra o percurso na ficha.

   O Curso e a Entidade escolhem-se de uma lista, e isto é a decisão que
   mais importa no ficheiro: "10868", "UFCD 10868" e "CRM 10868" seriam
   três cursos diferentes para o Repo, e os filtros das campanhas ("quem
   fez a 10868 e não a 10870") deixavam de funcionar. A lista vive na
   folha Listas e acrescenta-se lá. */
import ExcelJS from 'exceljs';
import path from 'node:path';

const SAIDA = process.argv[2] || 'modelo-formandos.xlsx';

const AZUL = 'FF0078BF', TINTA = 'FF171412', PAPEL = 'FFEFE9DD', CINZA = 'FF8A7F75', LINHA = 'FFD9D2C3';
const F = (extra = {}) => ({ name: 'Arial', size: 10, color: { argb: TINTA }, ...extra });

const wb = new ExcelJS.Workbook();
wb.creator = 'crm.cr0x.org';
wb.created = new Date();

/* ================= Formandos: a folha que se preenche ================= */
const ws = wb.addWorksheet('Formandos', { views: [{ state: 'frozen', ySplit: 1 }] });
const COLS = [
  { key: 'nome',     titulo: 'Nome',     largura: 18, nota: 'Obrigatório. Só o primeiro nome, ou os nomes próprios.' },
  { key: 'apelido',  titulo: 'Apelido',  largura: 22, nota: 'O apelido, ou os apelidos.' },
  { key: 'email',    titulo: 'Email',    largura: 32, nota: 'Obrigatório. O email pessoal. É por aqui que o Repo reconhece quem já fez formação contigo.' },
  { key: 'curso',    titulo: 'Curso',    largura: 30, nota: 'Obrigatório. Escolhe da lista. Se não estiver lá, acrescenta-o primeiro na folha Listas.' },
  { key: 'entidade', titulo: 'Entidade', largura: 22, nota: 'Obrigatório. Escolhe da lista (folha Listas).' },
  { key: 'inicio',   titulo: 'Início',   largura: 12, nota: 'Data de início da formação, dd/mm/aaaa.' },
  { key: 'fim',      titulo: 'Fim',      largura: 12, nota: 'Data de fim. Opcional.' },
  { key: 'notas',    titulo: 'Notas',    largura: 36, nota: 'Opcional. O que te ajudar a lembrar da pessoa.' },
];
ws.columns = COLS.map(c => ({ key: c.key, width: c.largura }));

const cab = ws.getRow(1);
COLS.forEach((c, i) => {
  const cel = cab.getCell(i + 1);
  cel.value = c.titulo;
  cel.font = F({ bold: true, color: { argb: 'FFFFFFFF' } });
  cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
  cel.alignment = { vertical: 'middle' };
  cel.note = { texts: [{ font: { name: 'Arial', size: 9 }, text: c.nota }] };
});
cab.height = 22;
ws.autoFilter = { from: 'A1', to: 'H1' };

/* 1000 linhas preparadas: letra, formato de data e as listas */
const N = 1000;
/* A lista lê só as células preenchidas da folha Listas - com um
   intervalo fixo, o Excel mostrava dezenas de opções em branco. */
const LISTA_CURSOS = 'OFFSET(Listas!$C$2,0,0,MAX(1,COUNTA(Listas!$C$2:$C$300)),1)';
const LISTA_ENTIDADES = 'OFFSET(Listas!$A$2,0,0,MAX(1,COUNTA(Listas!$A$2:$A$100)),1)';
for (let r = 2; r <= N + 1; r++) {
  const row = ws.getRow(r);
  for (let c = 1; c <= COLS.length; c++) row.getCell(c).font = F();
  row.getCell(6).numFmt = 'dd/mm/yyyy';
  row.getCell(7).numFmt = 'dd/mm/yyyy';

  row.getCell(3).dataValidation = {
    type: 'custom', allowBlank: true, showErrorMessage: true, errorStyle: 'warning',
    formulae: [`AND(ISNUMBER(FIND("@",C${r})),ISNUMBER(FIND(".",C${r})))`],
    errorTitle: 'Email', error: 'Isto não parece um email. Confirma antes de continuar.',
  };
  row.getCell(4).dataValidation = {
    type: 'list', allowBlank: true, showErrorMessage: true, errorStyle: 'stop',
    formulae: [LISTA_CURSOS],
    errorTitle: 'Curso', error: 'Escolhe da lista. Se o curso não existir, acrescenta-o primeiro na folha Listas.',
  };
  row.getCell(5).dataValidation = {
    type: 'list', allowBlank: true, showErrorMessage: true, errorStyle: 'stop',
    formulae: [LISTA_ENTIDADES],
    errorTitle: 'Entidade', error: 'Escolhe da lista. Se a entidade não existir, acrescenta-a primeiro na folha Listas.',
  };
  for (const c of [6, 7]) {
    row.getCell(c).dataValidation = {
      type: 'date', operator: 'greaterThan', allowBlank: true, showErrorMessage: true, errorStyle: 'warning',
      formulae: [new Date(Date.UTC(2000, 0, 1))],
      errorTitle: 'Data', error: 'Escreve a data como dd/mm/aaaa.',
    };
  }
}

/* ================= Listas: cursos e entidades ================= */
const wl = wb.addWorksheet('Listas');
wl.columns = [{ width: 26 }, { width: 3 }, { width: 40 }];
const tituloLista = (cel, t) => {
  cel.value = t;
  cel.font = F({ bold: true, color: { argb: 'FFFFFFFF' } });
  cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
};
tituloLista(wl.getCell('A1'), 'Entidades');
tituloLista(wl.getCell('C1'), 'Cursos');
['IEFP', 'Turismo de Portugal'].forEach((v, i) => { const c = wl.getCell(2 + i, 1); c.value = v; c.font = F(); });
/* Só os dois cursos que se sabe ao certo. Os nomes completos e os do
   Turismo de Portugal acrescenta-os quem os dá. */
['UFCD 10868', 'UFCD 10870'].forEach((v, i) => { const c = wl.getCell(2 + i, 3); c.value = v; c.font = F(); });
for (let r = 2; r <= 300; r++) { wl.getCell(r, 1).font = F(); wl.getCell(r, 3).font = F(); }
wl.getCell('E1').value = 'Acrescenta aqui, por baixo dos que já existem. Escreve cada curso sempre da mesma maneira: é pelo nome que o Repo os reconhece.';
wl.getCell('E1').font = F({ italic: true, color: { argb: CINZA } });
wl.getCell('E1').alignment = { wrapText: true, vertical: 'top' };
wl.getColumn(5).width = 46;

/* ================= Instruções ================= */
const wi = wb.addWorksheet('Instruções');
wi.columns = [{ width: 4 }, { width: 18 }, { width: 18 }, { width: 28 }, { width: 18 }, { width: 20 }, { width: 12 }, { width: 12 }, { width: 22 }];
let r = 2;
const linha = (txt, estilo = {}) => {
  const c = wi.getCell(r, 2); c.value = txt; c.font = F(estilo);
  wi.mergeCells(r, 2, r, 9); c.alignment = { wrapText: true, vertical: 'top' };
  r++;
};
linha('Como preencher', { bold: true, size: 14 });
r++;
linha('1. Preenche só a folha Formandos, a partir da linha 2. Não mudes os títulos nem o nome das folhas.');
linha('2. Uma linha = uma pessoa numa formação. Se alguém fez três formações contigo, aparece em três linhas. É assim mesmo: o Repo junta-as pelo email.');
linha('3. Curso e Entidade escolhem-se da lista. Se faltar algum, acrescenta-o primeiro na folha Listas.');
linha('4. Para várias pessoas do mesmo curso, preenche o Curso, a Entidade e as datas na primeira linha e arrasta para baixo.');
linha('5. Pode ser uma formação por ficheiro ou todas no mesmo. Os dois funcionam.');
linha('6. Grava como .xlsx e carrega no Repo, em Formandos.');
r++;
linha('Obrigatórios: Nome, Email, Curso, Entidade. O resto ajuda, mas pode ficar em branco.', { bold: true });
r++;
linha('Exemplo de uma linha preenchida', { bold: true });
const ex = [['Nome', 'Apelido', 'Email', 'Curso', 'Entidade', 'Início', 'Fim', 'Notas'],
            ['Ana', 'Martins', 'ana.martins@email.pt', 'UFCD 10868', 'IEFP', new Date(Date.UTC(2026, 8, 14)), new Date(Date.UTC(2026, 9, 30)), 'Turma da manhã']];
ex.forEach((vals, k) => {
  vals.forEach((v, i) => {
    const c = wi.getCell(r, 2 + i);
    c.value = v;
    if (k === 0) {
      c.font = F({ bold: true, color: { argb: 'FFFFFFFF' } });
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
    } else {
      c.font = F({ italic: true, color: { argb: CINZA } });
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PAPEL } };
      if (v instanceof Date) c.numFmt = 'dd/mm/yyyy';
    }
    c.border = { bottom: { style: 'thin', color: { argb: LINHA } } };
  });
  r++;
});
r++;
linha('Este exemplo é só para mostrar o formato: não o copies para a folha Formandos.', { italic: true, color: { argb: CINZA } });

/* impressas, as folhas cabem na largura de uma pagina: sem isto a
   das instrucoes partia-se ao meio */
for (const folha of [ws, wl, wi]) folha.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };

/* a folha que se preenche abre primeiro */
wb.views = [{ activeTab: 0 }];
await wb.xlsx.writeFile(SAIDA);
console.log('escrito: ' + path.resolve(SAIDA));
