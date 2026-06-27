// Catálogo bruto gerado a partir da planilha (carrinho_atualizado.xlsx).
// Custo = valor landed (mercadoria + imposto estimado). O preço de venda é
// calculado no seed aplicando margem. Não editar à mão; regenerar da planilha.

export interface CatalogoRaw {
  n: number
  cat: string
  nome: string
  conteudo: string
  custo: number
  origem: string
  obs: string
}

export const catalogoRaw: CatalogoRaw[] = [
  {
    "n": 1,
    "cat": "MCU / Dev Board",
    "nome": "NUCLEO-G0B1RE Nucleo-64 STM32G0B1RE (ST Oficial)",
    "conteudo": "5 un",
    "custo": 605.5,
    "origem": "Internacional",
    "obs": "5x Frete ~R$35 cada (verificar envio conjunto)"
  },
  {
    "n": 2,
    "cat": "MCU / Dev Board",
    "nome": "ESP32-S3 16MB N16R8 antena WiFi+BT módulo soldado",
    "conteudo": "1 un",
    "custo": 49.64,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 3,
    "cat": "MCU / Dev Board",
    "nome": "ESP32-C3 SuperMini USB-C WiFi+BT soldado",
    "conteudo": "1 un",
    "custo": 20.19,
    "origem": "Internacional",
    "obs": "⚠ 10 restantes"
  },
  {
    "n": 4,
    "cat": "MCU / Dev Board",
    "nome": "Arduino Uno R3 ATmega328P CH340G clone",
    "conteudo": "1 un",
    "custo": 35.44,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 5,
    "cat": "MCU / Dev Board",
    "nome": "Arduino Uno R3 + cabo USB HMXDIY (oferta relâmpago)",
    "conteudo": "1 un",
    "custo": 6.54,
    "origem": "Internacional",
    "obs": "⚠ Até 11 jul"
  },
  {
    "n": 6,
    "cat": "MCU / Dev Board",
    "nome": "Arduino Nano Type-C CH340 com bootloader",
    "conteudo": "1 un",
    "custo": 20.28,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 7,
    "cat": "Sensor / Módulo",
    "nome": "GY-521 MPU-6050 giroscópio+acelerômetro 6 eixos I2C",
    "conteudo": "1 un",
    "custo": 8.96,
    "origem": "Internacional",
    "obs": "⚠ Quase esgotado"
  },
  {
    "n": 8,
    "cat": "Sensor / Módulo",
    "nome": "BMI160 giroscópio+acelerômetro 6 DOF módulo",
    "conteudo": "1 un",
    "custo": 10.5,
    "origem": "Internacional",
    "obs": "⚠ 1 restante"
  },
  {
    "n": 9,
    "cat": "Sensor / Módulo",
    "nome": "INMP441 microfone omnidirecional I2S MEMS",
    "conteudo": "1 un",
    "custo": 7.49,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 10,
    "cat": "Sensor / Módulo",
    "nome": "DS18B20 à prova d'água 1m + módulo adaptador",
    "conteudo": "1 kit",
    "custo": 7.34,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 11,
    "cat": "Sensor / Módulo",
    "nome": "Joystick PS2 XY duplo eixo módulo Arduino",
    "conteudo": "1 un",
    "custo": 7.59,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 12,
    "cat": "Resistor",
    "nome": "200x resistores filme carbono 1/4W 5% (valor 10K)",
    "conteudo": "200 un",
    "custo": 6.2,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 13,
    "cat": "Resistor",
    "nome": "600x resistores filme metálico 1/4W 1% 30 valores",
    "conteudo": "600 un",
    "custo": 6.7,
    "origem": "Internacional",
    "obs": "⚠ Até 11 jul"
  },
  {
    "n": 14,
    "cat": "Resistor",
    "nome": "Kit resistores filme carbono 5W 30 valores 150 pcs",
    "conteudo": "150 un",
    "custo": 194.74,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 15,
    "cat": "Resistor",
    "nome": "10x resistor cimento 10W 10~25Ω IGMOPNRQ",
    "conteudo": "10 un",
    "custo": 20.05,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 16,
    "cat": "Resistor",
    "nome": "10x resistor cimento 10W 1Ω IBUW",
    "conteudo": "10 un",
    "custo": 20.25,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 17,
    "cat": "Capacitor",
    "nome": "Kit 120~500pcs capacitores eletrolíticos 16~50V 0.1uF~1000uF",
    "conteudo": "120-500 un",
    "custo": 22.3,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 18,
    "cat": "Capacitor",
    "nome": "300pcs capacitores cerâmicos 2pF~100nF 30 valores",
    "conteudo": "300 un",
    "custo": 9.76,
    "origem": "Internacional",
    "obs": "Frete R$31,73"
  },
  {
    "n": 19,
    "cat": "Transistor",
    "nome": "50x BC547+BC557 25 cada NPN/PNP TO-92",
    "conteudo": "50 un",
    "custo": 8.13,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 20,
    "cat": "Transistor",
    "nome": "100x BC337-40 NPN TO-92",
    "conteudo": "100 un",
    "custo": 11.17,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 21,
    "cat": "Transistor",
    "nome": "100x mix BC327/337/547/548/549/550/556/557/558 TO-92",
    "conteudo": "100 un",
    "custo": 10.4,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 22,
    "cat": "Transistor",
    "nome": "100x mix BC327/337/517/547~558 TO-92 IPUME",
    "conteudo": "100 un",
    "custo": 12.66,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 23,
    "cat": "Transistor",
    "nome": "200x 2N5551+2N5401 TO-92 100 cada",
    "conteudo": "200 un",
    "custo": 17.97,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 24,
    "cat": "Transistor",
    "nome": "50x BD139+BD140 TO-126 25 cada NPN/PNP 80V 1.5A",
    "conteudo": "50 un",
    "custo": 13.15,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 25,
    "cat": "Transistor",
    "nome": "100x BD131~BD238 TO-126 10 modelos kit",
    "conteudo": "100 un",
    "custo": 46.9,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 26,
    "cat": "Transistor",
    "nome": "10x TIP35C TO-247 NPN 100V/25A/125W",
    "conteudo": "10 un",
    "custo": 24.01,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 27,
    "cat": "Transistor",
    "nome": "5x 2N3055 TO-3 NPN 15A 60V áudio/potência",
    "conteudo": "5 un",
    "custo": 17.97,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 28,
    "cat": "MOSFET / Reg. TO-220",
    "nome": "10x IRFZ44N N-Channel TO-220 55V 49A",
    "conteudo": "10 un",
    "custo": 21.58,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 29,
    "cat": "MOSFET / Reg. TO-220",
    "nome": "10x LM317T regulador ajustável 1.2~37V 1.5A TO-220",
    "conteudo": "10 un",
    "custo": 12.16,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 30,
    "cat": "MOSFET / Reg. TO-220",
    "nome": "10x mix L7805/LM317T/IRF640/IRF740/IRF840/IRFZ44N/IRF3205 TO-220",
    "conteudo": "10 un",
    "custo": 11.54,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 31,
    "cat": "Diodo",
    "nome": "50x 1N4007 DO-41 1A 1000V",
    "conteudo": "50 un",
    "custo": 7.95,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 32,
    "cat": "Diodo",
    "nome": "50x 1N4148 comutação rápida DO-35",
    "conteudo": "50 un",
    "custo": 7.99,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 33,
    "cat": "Diodo",
    "nome": "Kit 14 valores diodos sortidos 1N4001~1N5822/UF4007/FR207/RL207",
    "conteudo": "~140 un",
    "custo": 21.58,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 34,
    "cat": "Diodo",
    "nome": "600x diodo zener 0.5W 2~39V 30 valores BZX55C kit",
    "conteudo": "600 un",
    "custo": 34.88,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 35,
    "cat": "Diodo",
    "nome": "150x diodo zener 1W 3~30V 15 valores DO-41 kit",
    "conteudo": "150 un",
    "custo": 15.59,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 36,
    "cat": "Diodo",
    "nome": "5x fotodiodo BPW34",
    "conteudo": "5 un",
    "custo": 15.59,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 37,
    "cat": "CI / IC",
    "nome": "85pcs kit IC DIP: NE555/LM324/LM393/UA741/ULN2803/LM358/LM386/NE5532/ULN2003/PC817",
    "conteudo": "85 un",
    "custo": 34.88,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 38,
    "cat": "CI / IC",
    "nome": "50x TL084CN DIP-14 quad op-amp JFET",
    "conteudo": "50 un",
    "custo": 24.01,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 39,
    "cat": "CI / IC",
    "nome": "10x NE555P + 10x soquete DIP-8",
    "conteudo": "20 un",
    "custo": 9.91,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 40,
    "cat": "CI / IC",
    "nome": "20x soquete DIP-8 pé plano 2.54mm",
    "conteudo": "20 un",
    "custo": 8.67,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 41,
    "cat": "LED",
    "nome": "100x LEDs 3mm 5 cores assortidos ultra brilhante",
    "conteudo": "100 un",
    "custo": 11.74,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 42,
    "cat": "LED / Fita",
    "nome": "Fita LED RGB 5m 3528 + fonte + controle IR",
    "conteudo": "1 kit",
    "custo": 10.79,
    "origem": "Brasil",
    "obs": ""
  },
  {
    "n": 43,
    "cat": "Buzzer",
    "nome": "5x buzzer passivo 9042 16Ω 3V AC",
    "conteudo": "5 un",
    "custo": 5.98,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 44,
    "cat": "Buzzer",
    "nome": "10x buzzer ativo TMB12A 3V/5V/12V tom contínuo",
    "conteudo": "10 un",
    "custo": 6.64,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 45,
    "cat": "Fusível",
    "nome": "Kit 60pcs fusíveis automotivos lâmina 2A~40A",
    "conteudo": "60 un",
    "custo": 10.2,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 46,
    "cat": "Fusível",
    "nome": "100x fusíveis vidro 5x20mm 0.2A~15A 10 valores",
    "conteudo": "100 un",
    "custo": 16.64,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 47,
    "cat": "Relé",
    "nome": "5x relé eletromagnético SRD-05VDC-SL-C 5 pinos 10A",
    "conteudo": "5 un",
    "custo": 13.15,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 48,
    "cat": "Protoboard / PCB",
    "nome": "25pcs PCB protótipo duplo lado 4x6/5x7/3x7/2x8cm",
    "conteudo": "25 un",
    "custo": 51.82,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 49,
    "cat": "Protoboard / PCB",
    "nome": "Kit 10x protoboard MB102 5x830pt + 5x400pt",
    "conteudo": "10 un",
    "custo": 23.34,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 50,
    "cat": "Protoboard / PCB",
    "nome": "Protoboard 400pt + jumpers DuPont 20cm 20pin",
    "conteudo": "1 kit",
    "custo": 12.1,
    "origem": "Internacional",
    "obs": "⚠ 4 restantes"
  },
  {
    "n": 51,
    "cat": "Jumper / Cabo Elétrico",
    "nome": "120x jumper wire 24AWG estanhado 8cm fly wire",
    "conteudo": "120 un",
    "custo": 12.89,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 52,
    "cat": "Jumper / Cabo Elétrico",
    "nome": "60x jumpers DuPont 30cm 20pin MM+FM+FF",
    "conteudo": "60 un",
    "custo": 14.37,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 53,
    "cat": "Jumper / Cabo Elétrico",
    "nome": "Set MM+FM+FF 10/20/30cm 40 fios cada",
    "conteudo": "120 un",
    "custo": 19.19,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 54,
    "cat": "Jumper / Cabo Elétrico",
    "nome": "560pcs jumper wire pré-formado sortido protoboard",
    "conteudo": "560 un",
    "custo": 24.01,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 55,
    "cat": "Jumper / Cabo Elétrico",
    "nome": "10x clipes jacaré 20cm DuPont macho/fêmea",
    "conteudo": "10 un",
    "custo": 24.01,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 56,
    "cat": "Jumper / Cabo Elétrico",
    "nome": "2x cabo teste jacaré p/ banana 1m multímetro",
    "conteudo": "2 un",
    "custo": 11.92,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 57,
    "cat": "Conector / Pino",
    "nome": "10x tira pinos 1x40 macho 2.54mm quebrável",
    "conteudo": "10 un",
    "custo": 9.89,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 58,
    "cat": "Encoder / Pot",
    "nome": "2x encoder rotativo com módulo e botão",
    "conteudo": "2 un",
    "custo": 11.61,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 59,
    "cat": "Encoder / Pot",
    "nome": "5x encoder rotativo EC11 360° 20 posições alça 12.5mm",
    "conteudo": "5 un",
    "custo": 16.75,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 60,
    "cat": "Encoder / Pot",
    "nome": "20x potenciômetro linear WH148 15mm 100K 3 pinos",
    "conteudo": "20 un",
    "custo": 27.62,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 61,
    "cat": "Encoder / Pot",
    "nome": "10x potenciômetro linear WH148 15mm sortidos 10K",
    "conteudo": "10 un",
    "custo": 17.97,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 62,
    "cat": "Encoder / Pot",
    "nome": "50pcs 3296W trimmer multivoltas 10 valores 500Ω~1MΩ",
    "conteudo": "50 un",
    "custo": 48.12,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 63,
    "cat": "Botão / Chave",
    "nome": "50x tact switch 6x6x5mm 4 pinos momentâneo",
    "conteudo": "50 un",
    "custo": 9.61,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 64,
    "cat": "Botão / Chave",
    "nome": "100/180/200x tact switch 6x6 alturas variadas kit",
    "conteudo": "100+ un",
    "custo": 20.41,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 65,
    "cat": "Botão / Chave",
    "nome": "100x tact switch 6x6 10 modelos sortidos 4.1~12mm",
    "conteudo": "100 un",
    "custo": 13.15,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 66,
    "cat": "Botão / Chave",
    "nome": "5x rocker switch redondo 20mm SPST c/ fio",
    "conteudo": "5 un",
    "custo": 13.15,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 67,
    "cat": "Botão / Chave",
    "nome": "15x mini rocker switch SPST 10x15mm preto/vermelho 250V 3A",
    "conteudo": "15 un",
    "custo": 11.67,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 68,
    "cat": "Botão / Chave",
    "nome": "10x toggle switch SPDT 3 pinos ON/ON 6A 125VAC",
    "conteudo": "10 un",
    "custo": 16.75,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 69,
    "cat": "Botão / Chave",
    "nome": "35x DIP switch 1~8 posições sortidos 2.54mm kit",
    "conteudo": "35 un",
    "custo": 22.8,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 70,
    "cat": "Botão / Chave",
    "nome": "10x micro switch fim de curso 5A 125/250V haste arco",
    "conteudo": "10 un",
    "custo": 13.0,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 71,
    "cat": "Botão / Chave",
    "nome": "20x chave deslizante SS12D00 3 pinos 1P2T 2 posições",
    "conteudo": "20 un",
    "custo": 10.14,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 72,
    "cat": "Dissipador",
    "nome": "10x dissipador alumínio TO-220 15x10x22mm",
    "conteudo": "10 un",
    "custo": 10.09,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 73,
    "cat": "Dissipador",
    "nome": "Dissipador alumínio 60x150x25mm para amplificadores",
    "conteudo": "1 un",
    "custo": 43.3,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 74,
    "cat": "Ferramenta Solda",
    "nome": "Ferro de solda 60W 220V + pontas + suporte + estanho",
    "conteudo": "1 kit",
    "custo": 21.58,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 75,
    "cat": "Ferramenta Solda",
    "nome": "Tapete silicone anti-calor magnético estação solda",
    "conteudo": "1 un",
    "custo": 16.75,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 76,
    "cat": "Ferramenta Solda",
    "nome": "Malha desolda wick 1mm 1.5m",
    "conteudo": "1 un",
    "custo": 9.26,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 77,
    "cat": "Ferramenta Geral",
    "nome": "Alicate diagonal Bomurphy aço carbono corte fio",
    "conteudo": "1 un",
    "custo": 14.37,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 78,
    "cat": "Ferramenta Geral",
    "nome": "Set 6x pinças ESD anti-estática aço inox longa precisão",
    "conteudo": "6 pcs",
    "custo": 13.15,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 79,
    "cat": "Instrumentação",
    "nome": "LCR-T7 testador transistor/diodo/cap/ESR/MOSFET TFT",
    "conteudo": "1 un",
    "custo": 79.44,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 80,
    "cat": "Instrumentação",
    "nome": "Multímetro DT-830B digital portátil",
    "conteudo": "1 un",
    "custo": 20.41,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 81,
    "cat": "Instrumentação",
    "nome": "Multímetro ANENG SZ818 PRO recarregável USB-C NCV",
    "conteudo": "1 un",
    "custo": 65.15,
    "origem": "Internacional",
    "obs": "R$54,05 p/ 2 un"
  },
  {
    "n": 82,
    "cat": "Instrumentação",
    "nome": "Multímetro NJTY T21D True RMS 6000 counts temp NCV",
    "conteudo": "1 un",
    "custo": 91.46,
    "origem": "Internacional",
    "obs": "R$75,90 p/ 2 un"
  },
  {
    "n": 83,
    "cat": "Instrumentação",
    "nome": "Multímetro ANENG XL830L ESR testador transistor DMM",
    "conteudo": "1 un",
    "custo": 35.38,
    "origem": "Internacional",
    "obs": "R$29,35 p/ 2 un"
  },
  {
    "n": 84,
    "cat": "Instrumentação",
    "nome": "Par ponteiras/sondas multímetro 1000V 10A banana",
    "conteudo": "1 par",
    "custo": 11.39,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 85,
    "cat": "Fonte / Alimentação",
    "nome": "Fonte AC 100-240V DC 16.8V 1A plug 5.5x2.1mm charger 18650 4S",
    "conteudo": "1 un",
    "custo": 20.41,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 86,
    "cat": "Bateria / Pilha",
    "nome": "Kit 10x 18650 Li-Ion EVE 2550mAh 3.6V",
    "conteudo": "10 un",
    "custo": 209.9,
    "origem": "Brasil",
    "obs": "Grupo de 3 = R$179,90"
  },
  {
    "n": 87,
    "cat": "Bateria / Pilha",
    "nome": "Bateria 9V 6F22 Expresol Heavy Duty",
    "conteudo": "1 un",
    "custo": 3.8,
    "origem": "Brasil",
    "obs": "Frete R$30,95"
  },
  {
    "n": 88,
    "cat": "Bateria / Pilha",
    "nome": "2x Pilha AAA DNA Ultra Power alcalina 1.5V",
    "conteudo": "2 un",
    "custo": 11.45,
    "origem": "Brasil",
    "obs": "Frete R$30,95"
  },
  {
    "n": 89,
    "cat": "Bateria / Pilha",
    "nome": "5x CR2450 Litio 3V Elgin",
    "conteudo": "5 un",
    "custo": 15.2,
    "origem": "Brasil",
    "obs": "Frete R$30,95"
  },
  {
    "n": 90,
    "cat": "Cabo USB/Dados",
    "nome": "3x cabo Lightning MFI certificado 1m/2m/3m",
    "conteudo": "3 un",
    "custo": 11.09,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 91,
    "cat": "Cabo USB/Dados",
    "nome": "Cabo Lightning trançado 1 un vários comprimentos",
    "conteudo": "1 un",
    "custo": 8.16,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 92,
    "cat": "Cabo USB/Dados",
    "nome": "Cabo Micro USB 5A carregamento rápido",
    "conteudo": "1 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 93,
    "cat": "Cabo USB/Dados",
    "nome": "Cabo USB-A para USB-C carregamento rápido",
    "conteudo": "1 un",
    "custo": 10.52,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 94,
    "cat": "Cabo USB/Dados",
    "nome": "Cabo USB-C para USB-C PD 100W 0.3m",
    "conteudo": "1 un",
    "custo": 8.28,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 95,
    "cat": "Cabo USB/Dados",
    "nome": "Cabo USB-C para USB-C 120W PD 6A trançado",
    "conteudo": "1 un",
    "custo": 13.15,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 96,
    "cat": "Cabo USB/Dados",
    "nome": "Cabo USB 3.0 macho-macho 1.5m 5Gbps",
    "conteudo": "1 un",
    "custo": 15.59,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 97,
    "cat": "Áudio / Fone",
    "nome": "Fone intra-auricular 3.5mm com microfone",
    "conteudo": "1 un",
    "custo": 11.49,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 98,
    "cat": "Áudio / Fone",
    "nome": "Fone Samsung Galaxy USB-C / 3.5mm HD microfone",
    "conteudo": "1 un",
    "custo": 9.97,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 99,
    "cat": "Áudio / Fone",
    "nome": "TWS Bluetooth A6S sem fio esportivo com microfone",
    "conteudo": "1 un",
    "custo": 22.8,
    "origem": "Internacional",
    "obs": ""
  },
  {
    "n": 100,
    "cat": "MCU / Dev Board",
    "nome": "Raspberry Pi Pico W RP2040 WiFi Bluetooth MicroPython",
    "conteudo": "1 un",
    "custo": 34.88,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 101,
    "cat": "MCU / Dev Board",
    "nome": "STM32F103C8T6 Blue Pill ARM Cortex-M3 72MHz",
    "conteudo": "1 un",
    "custo": 15.59,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 102,
    "cat": "MCU / Dev Board",
    "nome": "ESP8266 NodeMCU V3 WiFi Lua CH340 USB",
    "conteudo": "1 un",
    "custo": 17.97,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 103,
    "cat": "MCU / Dev Board",
    "nome": "Arduino Mega 2560 R3 ATmega2560 CH340G clone",
    "conteudo": "1 un",
    "custo": 39.69,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 104,
    "cat": "MCU / Dev Board",
    "nome": "Arduino Pro Mini 3.3V/5V ATmega328P 8/16MHz clone",
    "conteudo": "1 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 105,
    "cat": "Sensor / Módulo",
    "nome": "DHT11 sensor temperatura e umidade + placa módulo",
    "conteudo": "1 un",
    "custo": 5.92,
    "origem": "Internacional",
    "obs": "★ NOVO — best seller"
  },
  {
    "n": 106,
    "cat": "Sensor / Módulo",
    "nome": "DHT22 / AM2302 sensor temp+umidade alta precisão",
    "conteudo": "1 un",
    "custo": 11.95,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 107,
    "cat": "Sensor / Módulo",
    "nome": "HC-SR04 sensor ultrassônico distância 2~400cm",
    "conteudo": "1 un",
    "custo": 7.12,
    "origem": "Internacional",
    "obs": "★ NOVO — best seller"
  },
  {
    "n": 108,
    "cat": "Sensor / Módulo",
    "nome": "PIR HC-SR501 sensor de movimento infravermelho",
    "conteudo": "1 un",
    "custo": 7.12,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 109,
    "cat": "Sensor / Módulo",
    "nome": "BMP280 sensor pressão barométrica + temperatura I2C SPI",
    "conteudo": "1 un",
    "custo": 8.33,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 110,
    "cat": "Sensor / Módulo",
    "nome": "10x LDR GL5516 fotoresistor 5mm 5~10KΩ",
    "conteudo": "10 un",
    "custo": 5.92,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 111,
    "cat": "Sensor / Módulo",
    "nome": "10x NTC 10KΩ B3950 termistor temperatura MF52",
    "conteudo": "10 un",
    "custo": 5.92,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 112,
    "cat": "Sensor / Módulo",
    "nome": "Módulo sensor chuva FC-37 com comparador LM393",
    "conteudo": "1 un",
    "custo": 5.92,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 113,
    "cat": "Sensor / Módulo",
    "nome": "Módulo relé 1 canal 5V com optoacoplador baixo nível",
    "conteudo": "1 un",
    "custo": 5.92,
    "origem": "Internacional",
    "obs": "★ NOVO — best seller"
  },
  {
    "n": 114,
    "cat": "Sensor / Módulo",
    "nome": "Módulo relé 2 canais 5V com optoacoplador",
    "conteudo": "1 un",
    "custo": 8.33,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 115,
    "cat": "Sensor / Módulo",
    "nome": "Módulo relé 4 canais 5V com optoacoplador",
    "conteudo": "1 un",
    "custo": 11.95,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 116,
    "cat": "Sensor / Módulo",
    "nome": "HC-05 módulo Bluetooth UART slave/master 3.3V/5V",
    "conteudo": "1 un",
    "custo": 17.97,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 117,
    "cat": "Sensor / Módulo",
    "nome": "ESP-01 módulo WiFi ESP8266 8Mb flash",
    "conteudo": "1 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 118,
    "cat": "Sensor / Módulo",
    "nome": "Módulo leitor cartão SD SPI 3.3V/5V",
    "conteudo": "1 un",
    "custo": 5.92,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 119,
    "cat": "Sensor / Módulo",
    "nome": "DS3231 módulo RTC I2C alta precisão + EEPROM AT24C32",
    "conteudo": "1 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 120,
    "cat": "Sensor / Módulo",
    "nome": "TP4056 módulo carregador Li-Ion USB-C com proteção",
    "conteudo": "1 un",
    "custo": 5.92,
    "origem": "Internacional",
    "obs": "★ NOVO — best seller"
  },
  {
    "n": 121,
    "cat": "Sensor / Módulo",
    "nome": "Módulo buck DC-DC LM2596 ajustável 4~35V 2A",
    "conteudo": "1 un",
    "custo": 9.53,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 122,
    "cat": "Sensor / Módulo",
    "nome": "Módulo boost DC-DC MT3608 2~24V 2A ajustável",
    "conteudo": "1 un",
    "custo": 5.92,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 123,
    "cat": "Sensor / Módulo",
    "nome": "Módulo step-up/step-down XL6009 ajustável 5~32V 4A",
    "conteudo": "1 un",
    "custo": 11.95,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 124,
    "cat": "Sensor / Módulo",
    "nome": "OLED display 0.96 polegadas I2C 128x64 SSD1306 azul/branco",
    "conteudo": "1 un",
    "custo": 11.95,
    "origem": "Internacional",
    "obs": "★ NOVO — best seller"
  },
  {
    "n": 125,
    "cat": "Sensor / Módulo",
    "nome": "LCD 16x2 + módulo I2C PCF8574 backlight azul",
    "conteudo": "1 kit",
    "custo": 15.59,
    "origem": "Internacional",
    "obs": "★ NOVO — best seller"
  },
  {
    "n": 126,
    "cat": "CI / IC",
    "nome": "10x LM741CN DIP-8 op-amp clássico",
    "conteudo": "10 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 127,
    "cat": "CI / IC",
    "nome": "10x LM358N DIP-8 dual op-amp low power",
    "conteudo": "10 un",
    "custo": 9.53,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 128,
    "cat": "CI / IC",
    "nome": "10x LM393N DIP-8 dual comparador de tensão",
    "conteudo": "10 un",
    "custo": 9.53,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 129,
    "cat": "CI / IC",
    "nome": "10x LM324N DIP-14 quad op-amp low power",
    "conteudo": "10 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 130,
    "cat": "CI / IC",
    "nome": "10x LM386N DIP-8 amplificador de áudio 0.25~1W",
    "conteudo": "10 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 131,
    "cat": "CI / IC",
    "nome": "10x TL071CP DIP-8 JFET op-amp baixo ruído",
    "conteudo": "10 un",
    "custo": 11.95,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 132,
    "cat": "CI / IC",
    "nome": "10x TL072CP DIP-8 dual JFET op-amp baixo ruído",
    "conteudo": "10 un",
    "custo": 11.95,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 133,
    "cat": "CI / IC",
    "nome": "10x NE5532P DIP-8 dual op-amp áudio alta performance",
    "conteudo": "10 un",
    "custo": 11.95,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 134,
    "cat": "CI / IC",
    "nome": "10x ULN2003A DIP-16 driver Darlington 7 canais",
    "conteudo": "10 un",
    "custo": 9.53,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 135,
    "cat": "CI / IC",
    "nome": "10x PC817C optoacoplador DIP-4 70V 50mA",
    "conteudo": "10 un",
    "custo": 7.12,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 136,
    "cat": "CI / IC",
    "nome": "10x 74HC595N DIP-16 registrador de deslocamento 8-bit",
    "conteudo": "10 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 137,
    "cat": "CI / IC",
    "nome": "10x CD4017BE DIP-16 contador/divisor decimal CMOS",
    "conteudo": "10 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 138,
    "cat": "CI / IC",
    "nome": "10x CD4066BE DIP-14 quad bilateral switch CMOS",
    "conteudo": "10 un",
    "custo": 9.53,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 139,
    "cat": "CI / IC",
    "nome": "Kit soquetes DIP sortidos DIP-8/14/16/18/20/28/40",
    "conteudo": "~100 un",
    "custo": 15.59,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 140,
    "cat": "CI / IC",
    "nome": "10x AT24C256 EEPROM I2C 256Kbit DIP-8/SOP-8",
    "conteudo": "10 un",
    "custo": 11.95,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 141,
    "cat": "Capacitor",
    "nome": "Kit 100x capacitores filme poliéster 100nF~1uF 10 valores",
    "conteudo": "100 un",
    "custo": 15.59,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 142,
    "cat": "Capacitor",
    "nome": "Kit 50x capacitores tântalo SMD/axial 1uF~100uF sortidos",
    "conteudo": "50 un",
    "custo": 17.97,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 143,
    "cat": "Indutor / Cristal",
    "nome": "Kit 100x indutores axiais 1uH~10mH 10 valores",
    "conteudo": "100 un",
    "custo": 15.59,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 144,
    "cat": "Indutor / Cristal",
    "nome": "10x cristal 16MHz HC-49S para Arduino",
    "conteudo": "10 un",
    "custo": 7.12,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 145,
    "cat": "Indutor / Cristal",
    "nome": "10x cristal 8MHz HC-49S para microcontroladores",
    "conteudo": "10 un",
    "custo": 7.12,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 146,
    "cat": "Conector / Pino",
    "nome": "10x tira pinos 1x40 fêmea 2.54mm quebrável",
    "conteudo": "10 un",
    "custo": 9.53,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 147,
    "cat": "Conector / Pino",
    "nome": "50x KF301-2P borne parafuso 2 pinos 5.08mm PCB",
    "conteudo": "50 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 148,
    "cat": "Conector / Pino",
    "nome": "50x KF301-3P borne parafuso 3 pinos 5.08mm PCB",
    "conteudo": "50 un",
    "custo": 11.95,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 149,
    "cat": "Conector / Pino",
    "nome": "Kit conector JST XH 2.54mm 2/3/4/5/6 pinos sortidos 200pcs",
    "conteudo": "200 un",
    "custo": 17.97,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 150,
    "cat": "Conector / Pino",
    "nome": "10x plug DC fêmea 5.5x2.1mm painel montagem",
    "conteudo": "10 un",
    "custo": 8.33,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 151,
    "cat": "Conector / Pino",
    "nome": "10x plug DC macho 5.5x2.1mm para PCB",
    "conteudo": "10 un",
    "custo": 7.12,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 152,
    "cat": "Ferramenta Solda",
    "nome": "Estanho fio solda 0.8mm 60/40 Sn/Pb rolo 100g",
    "conteudo": "100g",
    "custo": 22.8,
    "origem": "Internacional",
    "obs": "★ NOVO — essencial"
  },
  {
    "n": 153,
    "cat": "Ferramenta Solda",
    "nome": "Pasta flux desoxidante RMA solda PCB 50g",
    "conteudo": "50g",
    "custo": 11.95,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 154,
    "cat": "Ferramenta Solda",
    "nome": "Sugador de solda manual pistão alumínio",
    "conteudo": "1 un",
    "custo": 11.95,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 155,
    "cat": "Ferramenta Geral",
    "nome": "Chave de fenda precisão kit 24 em 1 eletrônica",
    "conteudo": "1 kit",
    "custo": 24.01,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 156,
    "cat": "Ferramenta Geral",
    "nome": "Caixa organizadora componentes 25 divisórias",
    "conteudo": "1 un",
    "custo": 17.97,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 157,
    "cat": "Ferramenta Geral",
    "nome": "Caixa organizadora componentes 46 divisórias",
    "conteudo": "1 un",
    "custo": 24.01,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 158,
    "cat": "MOSFET / Reg. TO-220",
    "nome": "10x IRF3205 N-Channel TO-220 55V 110A",
    "conteudo": "10 un",
    "custo": 21.58,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 159,
    "cat": "MOSFET / Reg. TO-220",
    "nome": "10x L7805CV regulador fixo 5V TO-220",
    "conteudo": "10 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 160,
    "cat": "MOSFET / Reg. TO-220",
    "nome": "10x L7812CV regulador fixo 12V TO-220",
    "conteudo": "10 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": "★ NOVO"
  },
  {
    "n": 161,
    "cat": "Revenda Geral",
    "nome": "Carregador USB parede 5V 2.4A dual USB compacto",
    "conteudo": "1 un",
    "custo": 15.59,
    "origem": "Internacional",
    "obs": "★ NOVO revenda"
  },
  {
    "n": 162,
    "cat": "Revenda Geral",
    "nome": "Carregador USB-C PD 20W parede GaN compacto",
    "conteudo": "1 un",
    "custo": 24.01,
    "origem": "Internacional",
    "obs": "★ NOVO revenda"
  },
  {
    "n": 163,
    "cat": "Revenda Geral",
    "nome": "Hub USB 3.0 4 portas cabo 30cm compacto",
    "conteudo": "1 un",
    "custo": 20.41,
    "origem": "Internacional",
    "obs": "★ NOVO revenda"
  },
  {
    "n": 164,
    "cat": "Revenda Geral",
    "nome": "Cabo HDMI 2.0 4K 60Hz 1m nylon trançado",
    "conteudo": "1 un",
    "custo": 15.59,
    "origem": "Internacional",
    "obs": "★ NOVO revenda"
  },
  {
    "n": 165,
    "cat": "Revenda Geral",
    "nome": "Cabo HDMI 2.0 4K 60Hz 2m nylon trançado",
    "conteudo": "1 un",
    "custo": 17.97,
    "origem": "Internacional",
    "obs": "★ NOVO revenda"
  },
  {
    "n": 166,
    "cat": "Revenda Geral",
    "nome": "Adaptador USB-C para USB-A 3.0 fêmea OTG",
    "conteudo": "1 un",
    "custo": 8.33,
    "origem": "Internacional",
    "obs": "★ NOVO revenda"
  },
  {
    "n": 167,
    "cat": "Revenda Geral",
    "nome": "Adaptador OTG micro USB para USB-A fêmea",
    "conteudo": "1 un",
    "custo": 5.92,
    "origem": "Internacional",
    "obs": "★ NOVO revenda"
  },
  {
    "n": 168,
    "cat": "Revenda Geral",
    "nome": "Suporte case acrílico para Arduino Uno R3",
    "conteudo": "1 un",
    "custo": 10.74,
    "origem": "Internacional",
    "obs": "★ NOVO revenda"
  },
  {
    "n": 169,
    "cat": "Revenda Geral",
    "nome": "Suporte case acrílico para Raspberry Pi 4",
    "conteudo": "1 un",
    "custo": 15.59,
    "origem": "Internacional",
    "obs": "★ NOVO revenda"
  },
  {
    "n": 170,
    "cat": "Revenda Geral",
    "nome": "Kit iniciante Arduino: placa + 37 sensores + cabos + manual",
    "conteudo": "1 kit",
    "custo": 60.18,
    "origem": "Internacional",
    "obs": "★ NOVO revenda — best seller"
  },
  {
    "n": 171,
    "cat": "Revenda Geral",
    "nome": "Fonte chaveada 5V 10A 50W para projetos/fita LED",
    "conteudo": "1 un",
    "custo": 34.88,
    "origem": "Internacional",
    "obs": "★ NOVO revenda"
  },
  {
    "n": 172,
    "cat": "Revenda Geral",
    "nome": "Fonte chaveada 12V 5A 60W para projetos/automação",
    "conteudo": "1 un",
    "custo": 36.07,
    "origem": "Internacional",
    "obs": "★ NOVO revenda"
  },
  {
    "n": 173,
    "cat": "Revenda Geral",
    "nome": "Multímetro digital básico DT-830D bolso revenda",
    "conteudo": "1 un",
    "custo": 15.59,
    "origem": "Internacional",
    "obs": "★ NOVO revenda"
  }
]
