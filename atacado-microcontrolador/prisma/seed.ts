import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(t: string) {
  return t
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const categorias = [
  { nome: 'ST / ARM', slug: 'st-arm', icone: 'cpu' },
  { nome: 'ESP / WiFi', slug: 'esp-wifi', icone: 'wifi' },
  { nome: 'Arduino / AVR', slug: 'arduino-avr', icone: 'arduino' },
  { nome: 'Raspberry Pi', slug: 'raspberry-pi', icone: 'raspberry' },
  { nome: 'Acessórios', slug: 'acessorios', icone: 'cable' },
]

interface SeedProduto {
  sku: string
  nome: string
  preco: number
  precoOriginal?: number
  estoque: number
  categoria: string
  destaque?: boolean
  tags: string[]
  informal: string
  tecnica: string
  specs: Record<string, string>
  datasheet?: string
  recursos?: Record<string, string>
  peso?: number
}

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/800`

const produtos: SeedProduto[] = [
  // ---- ST / ARM ----
  {
    sku: 'STM-F4-DISC',
    nome: 'STM32F4 Discovery Clone',
    preco: 139.9,
    precoOriginal: 169.9,
    estoque: 23,
    categoria: 'st-arm',
    destaque: true,
    tags: ['ARM', 'CortexM4', 'FPU', 'ST', '168MHz', 'Debug', 'STLINK'],
    informal:
      'A placa que separa o brincalhão do engenheiro. O STM32F407 roda a 168MHz com FPU de verdade, então aquele seu filtro digital, sua FFT ou seu controle de motor finalmente vão rodar sem chorar por ciclos de clock.\n\nVem com ST-LINK on-board — ou seja, você pluga o USB e já tá debugando passo a passo, vendo registrador por registrador. Nada de comprar gravador separado, nada de gambiarra. É o kit que a maioria dos cursos de ARM usa, e por bom motivo.\n\nSe você tá saindo do Arduino e quer sentir o que é programar de verdade um Cortex-M4 — HAL, LL, CMSIS, bare metal, o que você quiser — essa é a porta de entrada mais honesta que existe.',
    tecnica:
      'Kit de desenvolvimento baseado no STM32F407VGT6, com acelerômetro, áudio DAC, microfone MEMS e ST-LINK/V2 integrado.',
    specs: {
      Arquitetura: 'ARM 32-bit',
      Core: 'Cortex-M4 + FPU',
      Clock: '168 MHz',
      Flash: '1 MB',
      RAM: '192 KB',
      GPIO: '~100 pinos',
      Interfaces: 'USB OTG, UART, SPI, I2C, CAN, SDIO',
      'ADC/DAC': '3x ADC 12-bit / 2x DAC 12-bit',
      Tensao: '3.3V (USB 5V)',
      Package: 'LQFP100',
      'Temp. operacao': '-40°C a 85°C',
    },
    datasheet: 'https://www.st.com/resource/en/datasheet/stm32f407vg.pdf',
    recursos: {
      referenceManual: 'https://www.st.com/resource/en/reference_manual/rm0090.pdf',
      github: 'https://github.com/STMicroelectronics/STM32CubeF4',
    },
    peso: 60,
  },
  {
    sku: 'STM-G0-NUC',
    nome: 'STM32G0 Nucleo Clone',
    preco: 84.9,
    estoque: 14,
    categoria: 'st-arm',
    tags: ['ARM', 'CortexM0plus', 'ST', 'LowPower', 'IoT'],
    informal:
      'O STM32G0 é a prova de que low-power não precisa ser sinônimo de fraco. Um Cortex-M0+ a 64MHz que consome quase nada, perfeito pra projetos a bateria que precisam durar meses.\n\nFormato Nucleo significa pinagem compatível com Arduino e ST morpho, então você aproveita shields e ainda tem ST-LINK embutido pra debug. É o equilíbrio entre custo, consumo e capacidade.\n\nIdeal pra sensores IoT, dispositivos vestíveis e qualquer coisa que precise acordar, medir, transmitir e voltar a dormir gastando microamperes.',
    tecnica: 'Placa Nucleo-64 baseada no STM32G071RB, focada em baixo consumo.',
    specs: {
      Arquitetura: 'ARM 32-bit',
      Core: 'Cortex-M0+',
      Clock: '64 MHz',
      Flash: '128 KB',
      RAM: '36 KB',
      GPIO: '~60 pinos',
      Interfaces: 'UART, SPI, I2C, USART, USB',
      'ADC/DAC': 'ADC 12-bit / DAC 12-bit',
      Tensao: '3.3V',
      Package: 'LQFP64',
      'Temp. operacao': '-40°C a 85°C',
    },
    datasheet: 'https://www.st.com/resource/en/datasheet/stm32g071rb.pdf',
    peso: 40,
  },
  {
    sku: 'STM-F103-BP',
    nome: 'STM32F103 Blue Pill',
    preco: 34.9,
    estoque: 4,
    categoria: 'st-arm',
    destaque: true,
    tags: ['ARM', 'CortexM3', 'ST', 'BluePill', 'Barato', 'Iniciante'],
    informal:
      'Sabe aquele ESP32 camarada? Imagina ele sem WiFi mas com ARM Cortex-M3 de 72MHz, 20KB de RAM e mais GPIOs do que você vai usar em vida. A Blue Pill é a rainha dos projetos sérios com budget de estudante.\n\nRoda FreeRTOS, HAL, Bare Metal — seu código, suas regras. É barata o suficiente pra você queimar uma sem chorar e poderosa o bastante pra projetos de verdade.\n\nPrecisa de um gravador ST-LINK (vendido à parte) ou pode usar o bootloader USB. É o clássico que todo mundo que mexe com ARM já teve na bancada.',
    tecnica: 'Placa compacta baseada no STM32F103C8T6, 40 pinos em formato breadboard-friendly.',
    specs: {
      Arquitetura: 'ARM 32-bit',
      Core: 'Cortex-M3',
      Clock: '72 MHz',
      Flash: '64 KB (128 KB em muitos clones)',
      RAM: '20 KB',
      GPIO: '37 pinos',
      Interfaces: 'USB, 3x UART, 2x SPI, 2x I2C, CAN',
      'ADC/DAC': '2x ADC 12-bit',
      Tensao: '3.3V (tolerante a 5V em alguns pinos)',
      Package: 'LQFP48',
      'Temp. operacao': '-40°C a 85°C',
    },
    datasheet: 'https://www.st.com/resource/en/datasheet/stm32f103c8.pdf',
    recursos: { github: 'https://github.com/stm32duino/Arduino_Core_STM32' },
    peso: 10,
  },
  {
    sku: 'STM-G431-NUC',
    nome: 'STM32G431KB Nucleo-32',
    preco: 109.9,
    estoque: 9,
    categoria: 'st-arm',
    tags: ['ARM', 'CortexM4', 'ST', 'MotorControl', 'CORDIC', 'FMAC'],
    informal:
      'Esse é o microcontrolador dos engenheiros de potência. O STM32G431 tem aceleradores de hardware CORDIC e FMAC — traduzindo: ele calcula seno, cosseno e filtros matemáticos em hardware, liberando a CPU pro resto.\n\nSe você mexe com controle de motor (FOC), conversores de potência ou qualquer coisa que exige malha de controle rápida, esse chip foi feito pra você. Tem comparadores e op-amps internos de alta velocidade.\n\nFormato Nucleo-32, compacto, com ST-LINK embutido. Pequeno no tamanho, gigante na matemática.',
    tecnica: 'Nucleo-32 com STM32G431KB, voltado a controle de motor e conversão de energia.',
    specs: {
      Arquitetura: 'ARM 32-bit',
      Core: 'Cortex-M4 + FPU',
      Clock: '170 MHz',
      Flash: '128 KB',
      RAM: '32 KB',
      GPIO: '~25 pinos',
      Interfaces: 'UART, SPI, I2C, USB, FDCAN',
      'ADC/DAC': '2x ADC 12-bit 4Msps / 3x DAC',
      Aceleradores: 'CORDIC, FMAC',
      Tensao: '3.3V',
      Package: 'LQFP32',
    },
    datasheet: 'https://www.st.com/resource/en/datasheet/stm32g431kb.pdf',
    peso: 25,
  },
  // ---- ESP ----
  {
    sku: 'ESP-32-WR',
    nome: 'ESP32 WROOM DevKit',
    preco: 44.9,
    precoOriginal: 54.9,
    estoque: 48,
    categoria: 'esp-wifi',
    destaque: true,
    tags: ['ESP32', 'WiFi', 'Bluetooth', 'DualCore', 'IoT', 'Arduino'],
    informal:
      'Dois núcleos. WiFi. Bluetooth. 520KB de RAM. Por menos de R$50. Se você ainda tá usando ESP8266, brother, chegou a hora de fazer o upgrade.\n\nO ESP32 WROOM é o canivete suíço da IoT — se tem um projeto que ele não resolve, você montou o projeto errado. Roda Arduino, ESP-IDF, MicroPython, e ainda sobra processamento pra rodar tarefas em paralelo nos dois cores.\n\nWiFi pra mandar dado pra nuvem, Bluetooth pra falar com o celular, GPIOs pra controlar o mundo. É o microcontrolador que transformou a palavra "IoT" de buzzword em projeto de fim de semana.',
    tecnica: 'DevKit com módulo ESP32-WROOM-32, USB-Serial CP2102/CH340, regulador 3.3V.',
    specs: {
      Arquitetura: 'Xtensa LX6 32-bit',
      Core: 'Dual-core',
      Clock: '240 MHz',
      Flash: '4 MB',
      RAM: '520 KB SRAM',
      GPIO: '38 pinos',
      Conectividade: 'WiFi 802.11 b/g/n + BT 4.2 BLE',
      Interfaces: 'UART, SPI, I2C, I2S, CAN, PWM',
      'ADC/DAC': '18x ADC 12-bit / 2x DAC 8-bit',
      Tensao: '3.3V (USB 5V)',
    },
    datasheet: 'https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf',
    recursos: { github: 'https://github.com/espressif/arduino-esp32' },
    peso: 12,
  },
  {
    sku: 'ESP-C3-DK',
    nome: 'ESP32-C3 DevKit',
    preco: 49.9,
    estoque: 27,
    categoria: 'esp-wifi',
    tags: ['ESP32', 'RISCV', 'WiFi', 'Bluetooth', 'LowCost'],
    informal:
      'A Espressif resolveu abraçar o RISC-V e o resultado é esse: um ESP32-C3 single-core RISC-V com WiFi e Bluetooth 5, num pacote enxuto e barato.\n\nÉ a escolha certa quando você quer conectividade moderna sem pagar pelo dual-core que talvez você nem use. BLE 5.0 com mais alcance, ideal pra beacons, sensores e automação residencial.\n\nArquitetura aberta RISC-V pra quem gosta de estar na vanguarda, com todo o ecossistema ESP-IDF e Arduino que você já conhece.',
    tecnica: 'DevKit com ESP32-C3, núcleo RISC-V de 32 bits e BLE 5.0.',
    specs: {
      Arquitetura: 'RISC-V 32-bit',
      Core: 'Single-core',
      Clock: '160 MHz',
      Flash: '4 MB',
      RAM: '400 KB SRAM',
      GPIO: '22 pinos',
      Conectividade: 'WiFi 802.11 b/g/n + BLE 5.0',
      Interfaces: 'UART, SPI, I2C, I2S',
      Tensao: '3.3V',
    },
    datasheet: 'https://www.espressif.com/sites/default/files/documentation/esp32-c3_datasheet_en.pdf',
    peso: 10,
  },
  {
    sku: 'ESP-S3-DK',
    nome: 'ESP32-S3 DevKit',
    preco: 64.9,
    estoque: 18,
    categoria: 'esp-wifi',
    destaque: true,
    tags: ['ESP32', 'WiFi', 'Bluetooth', 'USB', 'ML', 'Camera', 'AI'],
    informal:
      'O ESP32-S3 é o que acontece quando a Espressif decide entrar na onda de IA na borda. Tem instruções vetoriais pra acelerar redes neurais, USB nativo e suporte a câmera e display.\n\nQuer fazer reconhecimento de voz, detecção de objetos ou wake-word sem mandar nada pra nuvem? Esse é o chip. Roda TensorFlow Lite Micro numa boa e ainda tem PSRAM pra segurar os buffers de imagem.\n\nDual-core a 240MHz, USB OTG nativo (chega de chip serial separado) e todo o ecossistema ESP. É o ESP32 crescido e indo pra academia.',
    tecnica: 'DevKit com ESP32-S3, aceleração de IA, USB OTG nativo e suporte a câmera/LCD.',
    specs: {
      Arquitetura: 'Xtensa LX7 32-bit',
      Core: 'Dual-core',
      Clock: '240 MHz',
      Flash: '8 MB',
      RAM: '512 KB + PSRAM',
      GPIO: '45 pinos',
      Conectividade: 'WiFi 802.11 b/g/n + BLE 5.0',
      Aceleracao: 'Instruções vetoriais para ML',
      Interfaces: 'USB OTG, UART, SPI, I2C, I2S, LCD, Camera',
      Tensao: '3.3V',
    },
    datasheet: 'https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf',
    peso: 13,
  },
  {
    sku: 'ESP-8266-NM',
    nome: 'ESP8266 NodeMCU',
    preco: 28.9,
    estoque: 0,
    categoria: 'esp-wifi',
    tags: ['ESP8266', 'WiFi', 'IoT', 'Barato', 'Legado'],
    informal:
      'O microcontrolador que democratizou a IoT. Antes do ESP8266, colocar WiFi num projeto era caro e complicado. Depois dele, virou questão de alguns reais.\n\nÉ legado? Tecnicamente sim, o ESP32 é superior em tudo. Mas pra um projeto simples que só precisa mandar uma leitura pro servidor a cada X minutos, o NodeMCU continua imbatível em custo-benefício.\n\nUm único core a 80MHz, WiFi, e GPIOs suficientes pra automação básica. O cavalo de batalha que ainda roda em milhões de projetos pelo mundo.',
    tecnica: 'Placa NodeMCU com ESP8266 (ESP-12E) e conversor USB-Serial.',
    specs: {
      Arquitetura: 'Xtensa L106 32-bit',
      Core: 'Single-core',
      Clock: '80 MHz (até 160)',
      Flash: '4 MB',
      RAM: '~80 KB',
      GPIO: '17 pinos (11 utilizáveis)',
      Conectividade: 'WiFi 802.11 b/g/n',
      Interfaces: 'UART, SPI, I2C, PWM',
      'ADC/DAC': '1x ADC 10-bit',
      Tensao: '3.3V',
    },
    datasheet: 'https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf',
    peso: 10,
  },
  // ---- Arduino ----
  {
    sku: 'ARD-UNO-R3',
    nome: 'Arduino Uno R3 Clone',
    preco: 34.9,
    estoque: 65,
    categoria: 'arduino-avr',
    destaque: true,
    tags: ['Arduino', 'AVR', 'ATmega328', 'Iniciante', 'Educacional'],
    informal:
      'O ponto de partida de praticamente todo mundo que mexe com eletrônica. O Arduino Uno não é o mais rápido, nem o mais poderoso — e tá tudo bem, porque ele não precisa ser.\n\nO que ele é: confiável, à prova de iniciante, com a maior comunidade do planeta. Qualquer dúvida que você tiver, alguém já resolveu e postou. Qualquer sensor que você comprar, tem biblioteca pronta.\n\nATmega328P, 14 portas digitais, 6 analógicas, conector USB e pronto pra shields. Se você tá começando, comece aqui. Se você é veterano, você tem uns três na gaveta.',
    tecnica: 'Clone compatível do Arduino Uno R3 com ATmega328P e CH340.',
    specs: {
      Arquitetura: 'AVR 8-bit',
      Core: 'ATmega328P',
      Clock: '16 MHz',
      Flash: '32 KB',
      RAM: '2 KB',
      GPIO: '14 digitais / 6 analógicas',
      Interfaces: 'UART, SPI, I2C',
      'ADC/DAC': '6x ADC 10-bit',
      Tensao: '5V',
      Alimentacao: 'USB ou 7-12V DC',
    },
    recursos: { github: 'https://github.com/arduino/ArduinoCore-avr' },
    peso: 25,
  },
  {
    sku: 'ARD-NANO-V3',
    nome: 'Arduino Nano Clone',
    preco: 24.9,
    estoque: 52,
    categoria: 'arduino-avr',
    tags: ['Arduino', 'AVR', 'Compacto', 'Breadboard', 'Iniciante'],
    informal:
      'É o Arduino Uno que foi pra academia, perdeu peso e agora cabe na sua protoboard. Mesmo cérebro (ATmega328P), mesma facilidade, formato minúsculo.\n\nPerfeito pra quando o projeto sai da bancada e vai pra dentro de uma caixinha. Espeta direto na breadboard, sem fios de jumper voando pra todo lado.\n\nSe o Uno é pra prototipar e aprender, o Nano é pra embarcar de verdade no projeto final mantendo a simplicidade.',
    tecnica: 'Clone do Arduino Nano V3 com ATmega328P, formato DIP para breadboard.',
    specs: {
      Arquitetura: 'AVR 8-bit',
      Core: 'ATmega328P',
      Clock: '16 MHz',
      Flash: '32 KB',
      RAM: '2 KB',
      GPIO: '14 digitais / 8 analógicas',
      Interfaces: 'UART, SPI, I2C',
      'ADC/DAC': '8x ADC 10-bit',
      Tensao: '5V',
    },
    peso: 8,
  },
  {
    sku: 'ARD-MEGA-256',
    nome: 'Arduino Mega 2560 Clone',
    preco: 64.9,
    estoque: 21,
    categoria: 'arduino-avr',
    tags: ['Arduino', 'AVR', 'ATmega2560', 'GPIOs', 'Shield'],
    informal:
      'Quando 14 pinos não chegam nem perto, você chama o Mega. São 54 portas digitais e 16 analógicas — é GPIO pra dar e vender.\n\nÉ a placa dos projetos grandes: impressoras 3D (sim, muitas rodam em Mega), painéis com dezenas de relés, controladoras de domótica completas. Quando o projeto cresce, o Mega segura.\n\nMais Flash, mais RAM, mais portas seriais (são 4!). Mesma facilidade Arduino que você já conhece, só que num tamanho que comporta ambição.',
    tecnica: 'Clone do Arduino Mega 2560 com ATmega2560 e amplo número de GPIOs.',
    specs: {
      Arquitetura: 'AVR 8-bit',
      Core: 'ATmega2560',
      Clock: '16 MHz',
      Flash: '256 KB',
      RAM: '8 KB',
      GPIO: '54 digitais / 16 analógicas',
      Interfaces: '4x UART, SPI, I2C',
      'ADC/DAC': '16x ADC 10-bit',
      Tensao: '5V',
    },
    peso: 37,
  },
  // ---- Raspberry Pi ----
  {
    sku: 'RPI-4-4GB',
    nome: 'Raspberry Pi 4 Model B 4GB',
    preco: 449.9,
    estoque: 11,
    categoria: 'raspberry-pi',
    destaque: true,
    tags: ['RaspberryPi', 'Linux', 'ARM', 'SBC', 'Python', 'GPIO'],
    informal:
      'Não é microcontrolador, é um computador inteiro do tamanho de um cartão. O Raspberry Pi 4 roda Linux completo, navega na internet, serve mídia e ainda controla GPIO.\n\nQuatro núcleos Cortex-A72, 4GB de RAM, duas saídas HDMI 4K, USB 3.0 e Gigabit Ethernet. É servidor doméstico, central de automação, retro-game, NAS, o que você imaginar.\n\nQuando o ESP32 é pouco e você precisa de um sistema operacional de verdade, Python rodando liso e poder de processamento, o Pi 4 entrega tudo isso consumindo pouquíssima energia.',
    tecnica: 'SBC Raspberry Pi 4 Model B com 4GB LPDDR4, Broadcom BCM2711.',
    specs: {
      Arquitetura: 'ARM 64-bit',
      Core: 'Quad-core Cortex-A72',
      Clock: '1.5 GHz',
      RAM: '4 GB LPDDR4',
      Armazenamento: 'microSD',
      GPIO: '40 pinos',
      Conectividade: 'WiFi dual-band, BT 5.0, Gigabit Ethernet',
      Video: '2x micro-HDMI 4K',
      USB: '2x USB 3.0 + 2x USB 2.0',
      Tensao: '5V / 3A USB-C',
    },
    datasheet: 'https://datasheets.raspberrypi.com/rpi4/raspberry-pi-4-datasheet.pdf',
    peso: 46,
  },
  {
    sku: 'RPI-5-4GB',
    nome: 'Raspberry Pi 5 4GB',
    preco: 599.9,
    estoque: 7,
    categoria: 'raspberry-pi',
    tags: ['RaspberryPi', 'Linux', 'ARM', 'SBC', 'PCIe', 'Novo'],
    informal:
      'A geração mais nova e mais brava. O Pi 5 chega com Cortex-A76 a 2.4GHz — é mais que o dobro de desempenho do Pi 4 em muitas tarefas.\n\nA grande novidade é o conector PCIe: agora dá pra plugar SSD NVMe e ter velocidade de armazenamento de gente grande. Tem também o novo chip RP1 que gerencia toda a I/O, deixando a CPU livre.\n\nPython, Docker, IA leve, servidores, projetos pesados de visão computacional — o Pi 5 aguenta o tranco que o Pi 4 começava a sentir. É o futuro dos SBCs já na sua bancada.',
    tecnica: 'SBC Raspberry Pi 5 com 4GB LPDDR4X, Broadcom BCM2712 e conector PCIe 2.0.',
    specs: {
      Arquitetura: 'ARM 64-bit',
      Core: 'Quad-core Cortex-A76',
      Clock: '2.4 GHz',
      RAM: '4 GB LPDDR4X',
      Armazenamento: 'microSD + PCIe 2.0 (NVMe)',
      GPIO: '40 pinos',
      Conectividade: 'WiFi dual-band, BT 5.0, Gigabit Ethernet',
      Video: '2x micro-HDMI 4K60',
      USB: '2x USB 3.0 + 2x USB 2.0',
      Tensao: '5V / 5A USB-C',
    },
    datasheet: 'https://datasheets.raspberrypi.com/rpi5/raspberry-pi-5-product-brief.pdf',
    peso: 46,
  },
  // ---- Acessórios ----
  {
    sku: 'ACE-USBC-1M',
    nome: 'Cabo USB-C 1m',
    preco: 14.9,
    estoque: 120,
    categoria: 'acessorios',
    tags: ['Cabo', 'USBC', 'Acessório'],
    informal:
      'O cabo que toda placa moderna pede e que você sempre esquece de comprar junto. USB-C de 1 metro, com fios de boa bitola pra dados e energia.\n\nServe pro seu ESP32-S3, pro Pi 5, pro notebook, pro celular — USB-C virou padrão universal e esse aqui dá conta do recado sem aquecer nem cair a conexão no meio do upload.\n\nNada glamouroso, mas indispensável. Compre dois, você vai precisar.',
    tecnica: 'Cabo USB-C para USB-A, 1 metro, suporte a dados e carga.',
    specs: {
      Comprimento: '1 metro',
      Conectores: 'USB-A → USB-C',
      'Corrente máx.': '3A',
      Dados: 'USB 2.0 480 Mbps',
    },
    peso: 30,
  },
  {
    sku: 'ACE-MUSB-1M',
    nome: 'Cabo Micro-USB 1m',
    preco: 11.9,
    estoque: 140,
    categoria: 'acessorios',
    tags: ['Cabo', 'MicroUSB', 'Acessório', 'Arduino'],
    informal:
      'O bom e velho micro-USB, que ainda alimenta metade das placas da sua gaveta. Arduino Nano, ESP32 clássico, NodeMCU — todos pedem esse conector.\n\nUm metro de comprimento, fio reforçado pra aguentar o vai-e-vem da bancada. Daqueles que não desencaixam à toa no meio da gravação.\n\nClássico que não sai de moda enquanto houver placa antiga rodando projeto — ou seja, por muito tempo ainda.',
    tecnica: 'Cabo USB-A para Micro-USB, 1 metro, dados e carga.',
    specs: {
      Comprimento: '1 metro',
      Conectores: 'USB-A → Micro-USB',
      'Corrente máx.': '2A',
      Dados: 'USB 2.0 480 Mbps',
    },
    peso: 28,
  },
  {
    sku: 'ACE-SHIELD-KIT',
    nome: 'Shield Sensor Kit 37pcs',
    preco: 54.9,
    precoOriginal: 69.9,
    estoque: 33,
    categoria: 'acessorios',
    destaque: true,
    tags: ['Shield', 'Sensor', 'Kit', 'Arduino', 'Educacional'],
    informal:
      'Trinta e sete módulos de sensores numa caixa só. É o kit que transforma "não sei o que fazer" em "não sei por onde começar de tanta opção".\n\nTem sensor de temperatura, de luz, de som, de toque, joystick, LEDs RGB, buzzer, relé, sensor de chama, de inclinação... uma feira de eletrônica numa caixa organizada.\n\nPerfeito pra quem tá aprendendo e quer experimentar de tudo, ou pra prototipar rápido sem ter que comprar módulo por módulo. Cada peça vem com pinos prontos pra jumper. Aprendizado garantido por meses.',
    tecnica: 'Kit educacional com 37 módulos de sensores compatíveis com Arduino/ESP.',
    specs: {
      Peças: '37 módulos',
      Compatibilidade: 'Arduino, ESP32, ESP8266, STM32',
      Inclui: 'Sensores de luz, som, temperatura, toque, joystick, relé e mais',
      Conexao: 'Pinos macho para jumper',
      Tensao: '3.3V / 5V',
    },
    peso: 350,
  },
  {
    sku: 'ACE-PROTO-830',
    nome: 'Protoboard 830 furos',
    preco: 24.9,
    estoque: 88,
    categoria: 'acessorios',
    tags: ['Protoboard', 'Breadboard', 'Prototipagem'],
    informal:
      'A bancada de testes que não solda nada. 830 furos pra você montar, desmontar e remontar seu circuito quantas vezes quiser sem ferro de solda.\n\nTem trilhas de alimentação nas laterais, barramento central pra encaixar CIs DIP, e contatos que seguram bem o jumper sem ficar bambo. A base da prototipagem rápida.\n\nDo primeiro pisca-LED ao circuito mais maluco, tudo começa numa protoboard. Tenha sempre uma (ou três) à mão.',
    tecnica: 'Protoboard de 830 pontos com trilhas de alimentação duplas.',
    specs: {
      Furos: '830 pontos',
      Trilhas: '2 barramentos de alimentação',
      'Espaçamento': '2.54mm',
      Material: 'ABS + contatos de bronze',
    },
    peso: 60,
  },
  {
    sku: 'ACE-JUMPER-40',
    nome: 'Jumpers M-M 40pcs',
    preco: 12.9,
    estoque: 95,
    categoria: 'acessorios',
    tags: ['Jumper', 'Cabo', 'Prototipagem'],
    informal:
      'Os fiozinhos coloridos que fazem a mágica acontecer. 40 jumpers macho-macho pra conectar tudo na sua protoboard.\n\nVêm coloridos (e isso importa: vermelho pro VCC, preto pro GND, e você não se perde no meio do circuito). Pontas firmes que encaixam direitinho.\n\nNinguém nunca tem jumpers suficientes — é lei da bancada. Por esse preço, garanta alguns pacotes e nunca mais fique na mão no meio de um projeto.',
    tecnica: 'Kit com 40 jumpers macho-macho coloridos para protoboard.',
    specs: {
      Quantidade: '40 unidades',
      Tipo: 'Macho-Macho',
      Comprimento: '~20cm',
      Cores: 'Sortidas',
    },
    peso: 40,
  },
]

async function main() {
  console.log('🌱 Seed iniciado...')

  // Categorias
  const catMap = new Map<string, string>()
  for (const c of categorias) {
    const cat = await prisma.categoria.upsert({
      where: { slug: c.slug },
      update: { nome: c.nome, icone: c.icone },
      create: c,
    })
    catMap.set(c.slug, cat.id)
  }
  console.log(`✓ ${categorias.length} categorias`)

  // Tags (coletadas de todos os produtos)
  const tagSet = new Set<string>()
  produtos.forEach((p) => p.tags.forEach((t) => tagSet.add(t)))
  const tagMap = new Map<string, string>()
  for (const nome of Array.from(tagSet)) {
    const tag = await prisma.tag.upsert({
      where: { slug: slugify(nome) },
      update: { nome },
      create: { nome, slug: slugify(nome) },
    })
    tagMap.set(nome, tag.id)
  }
  console.log(`✓ ${tagSet.size} tags`)

  // Produtos
  for (const p of produtos) {
    const slug = slugify(p.nome)
    const produto = await prisma.produto.upsert({
      where: { sku: p.sku },
      update: {
        nome: p.nome,
        preco: new Prisma.Decimal(p.preco),
        precoOriginal: p.precoOriginal ? new Prisma.Decimal(p.precoOriginal) : null,
        estoque: p.estoque,
        destaque: p.destaque ?? false,
        descricaoInformal: p.informal,
        descricaoTecnica: p.tecnica,
        especificacoes: p.specs,
        recursosUrls: p.recursos ?? Prisma.JsonNull,
        datasheetUrl: p.datasheet ?? null,
        pesoGramas: p.peso ?? null,
      },
      create: {
        nome: p.nome,
        slug,
        sku: p.sku,
        descricaoInformal: p.informal,
        descricaoTecnica: p.tecnica,
        especificacoes: p.specs,
        preco: new Prisma.Decimal(p.preco),
        precoOriginal: p.precoOriginal ? new Prisma.Decimal(p.precoOriginal) : null,
        estoque: p.estoque,
        imagens: [img(p.sku), img(p.sku + '-2'), img(p.sku + '-3')],
        datasheetUrl: p.datasheet ?? null,
        recursosUrls: p.recursos ?? Prisma.JsonNull,
        pesoGramas: p.peso ?? null,
        destaque: p.destaque ?? false,
        categoriaId: catMap.get(p.categoria)!,
      },
    })

    // Tags do produto
    for (const t of p.tags) {
      await prisma.produtoTag.upsert({
        where: { produtoId_tagId: { produtoId: produto.id, tagId: tagMap.get(t)! } },
        update: {},
        create: { produtoId: produto.id, tagId: tagMap.get(t)! },
      })
    }
  }
  console.log(`✓ ${produtos.length} produtos`)

  // Usuário admin
  await prisma.usuario.upsert({
    where: { email: 'admin@atacadomicro.com.br' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@atacadomicro.com.br',
      nomeCompleto: 'Administrador',
      cpf: '00000000191',
      telefone: '51999999999',
      dataNasc: new Date('1990-01-01'),
      role: 'ADMIN',
      emailVerificado: true,
    },
  })
  console.log('✓ usuário admin (admin@atacadomicro.com.br)')

  // Cupons
  const cupons = [
    { codigo: 'BEMVINDO10', tipo: 'PERCENTUAL' as const, valor: 10, minimo: 50, maxUsos: 1000 },
    { codigo: 'MAKER15', tipo: 'PERCENTUAL' as const, valor: 15, minimo: 200, maxUsos: 500 },
    { codigo: 'FRETE20', tipo: 'FIXO' as const, valor: 20, minimo: 100, maxUsos: 300 },
  ]
  for (const c of cupons) {
    await prisma.cupom.upsert({
      where: { codigo: c.codigo },
      update: {},
      create: {
        codigo: c.codigo,
        tipo: c.tipo,
        valor: new Prisma.Decimal(c.valor),
        minimo: new Prisma.Decimal(c.minimo),
        maxUsos: c.maxUsos,
      },
    })
  }
  console.log(`✓ ${cupons.length} cupons`)

  console.log('✅ Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
