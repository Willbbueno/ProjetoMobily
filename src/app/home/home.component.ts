import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Map, map, tileLayer, Browser, Icon, Marker } from 'leaflet';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLElement>;
  private leafletMap!: Map;
  private marcadorSelecionado!: Marker;

  mostrarFormulario = false;

  form = new FormGroup({
    nomeLocal: new FormControl('', Validators.required),
    categoria: new FormControl('', Validators.required),
    limitacoes: new FormControl<string[]>([], Validators.required),
    frequencia: new FormControl('', Validators.required),
    avaliacao: new FormControl('', Validators.required)
  });

  categorias: string[] = [
    'Biblioteca',
    'Centro Esportivo',
    'Cinema',
    'Clínica',
    'Correios',
    'Delegacia',
    'Escola',
    'Estação de ônibus',
    'Estação de trem',
    'Farmácia',
    'Hospital',
    'Igreja',
    'Loja',
    'Mercado',
    'Museu',
    'Parque',
    'Praça',
    'Restaurante',
    'Rua',
    'Shopping',
    'Teatro',
    'Universidade',
    'Outro'
  ]
  

  limitacoes: string[] = [
    'Nenhum',
    'Acesso bloqueado por obstáculos',
    'Atendimento sem intérprete de Libras',
    'Ausência de botão de emergência',
    'Ausência de corrimão',
    'Banheiro adaptado',
    'Calçada irregular',
    'Degraus sem alternativa',
    'Distância longa sem apoio',
    'Elevador',
    'Iluminação insuficiente',
    'Piso escorregadio',
    'Piso tátil',
    'Porta estreita',
    'Pouca sinalização sonora',
    'Pouca sinalização visual',
    'Rampa',
    'Vagas para PCD ausentes'
  ]


  frequencias: string[] = ['Alto', 'Médio', 'Baixo'];
  avaliacoes: number[] = [1, 2, 3, 4, 5];

  locaisCadastrados: any[] = [];

  iconeLocal = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    const initialState = {
      lat: -23.5015,
      lng: -47.4526,
      zoom: 13
    };

    this.leafletMap = map(this.mapContainer.nativeElement).setView(
      [initialState.lat, initialState.lng],
      initialState.zoom
    );

    const apiKey = 'b992d623b3cc40b492be9fa96c416986';
    const isRetina = Browser.retina;

    const baseUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`;
    const retinaUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey=${apiKey}`;

    tileLayer(isRetina ? retinaUrl : baseUrl, {
      attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>',
      maxZoom: 20
    } as any).addTo(this.leafletMap);

    this.leafletMap.on('click', (e: any) => {
      const { lat, lng } = e.latlng;

      if (this.marcadorSelecionado) {
        this.leafletMap.removeLayer(this.marcadorSelecionado);
      }

      this.marcadorSelecionado = new Marker([lat, lng], {
        icon: this.iconeLocal
      }).addTo(this.leafletMap)
        .bindPopup('Local selecionado')
        .openPopup();

      this.marcadorSelecionado.on('popupclose', () => {
        this.leafletMap.removeLayer(this.marcadorSelecionado);
        this.mostrarFormulario = false;
      });

      this.mostrarFormulario = true;
      this.form.reset();
    });
  }

  salvarLocal(): void {
    if (this.form.valid) {
      const confirmar = window.confirm('Deseja realmente salvar este local?');

      if (confirmar) {
        const novoLocal = {
          ...this.form.value,
          limitacoes: Array.isArray(this.form.value.limitacoes)
            ? this.form.value.limitacoes
            : [this.form.value.limitacoes]  // converte para array caso não seja
        };

        this.locaisCadastrados.push(novoLocal);
        this.form.reset();
        this.mostrarFormulario = false;

        if (this.marcadorSelecionado) {
          this.leafletMap.removeLayer(this.marcadorSelecionado);
        }

        const coordenadas = this.marcadorSelecionado.getLatLng();

        const marcador = new Marker([coordenadas.lat, coordenadas.lng], {
          icon: this.iconeLocal
        }).addTo(this.leafletMap);

        marcador.bindPopup(`
            <strong>${novoLocal.nomeLocal}</strong><br>
            Categoria: ${novoLocal.categoria}<br>
            Limitações: ${novoLocal.limitacoes.join(', ')}<br>
            Frequência: ${novoLocal.frequencia}<br>
            Avaliação: ${novoLocal.avaliacao} estrela(s)
        `);
      }
    }
  }

  exportarPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Locais Acessíveis', 10, 10);
    doc.setFontSize(12);
    doc.text('Análise de acessibilidade dos locais cadastrados.', 10, 20);

    const maioresBarreiras = this.calcularMaioresBarreiras();
    doc.text(`Maiores barreiras encontradas: ${maioresBarreiras}`, 10, 30);

    const categoriasComMaisBarreiras = this.calcularCategoriasComMaisBarreiras();
    doc.text(`Categorias com maiores barreiras: ${categoriasComMaisBarreiras}`, 10, 40);

    const dadosTabela = this.locaisCadastrados.map(local => [
      local.nomeLocal,
      local.categoria,
      Array.isArray(local.limitacoes) ? local.limitacoes.join(', ') : local.limitacoes,
      local.frequencia,
      local.avaliacao
    ]);

    autoTable(doc, {
      head: [['Nome', 'Categoria', 'Limitações', 'Frequência', 'Avaliação']],
      body: dadosTabela,
      startY: 50
    });

    doc.save('relatorio-locais.pdf');
  }

  calcularMaioresBarreiras(): string {
    const contagem: { [key: string]: number } = {};
    for (const local of this.locaisCadastrados) {
      for (const limitacao of local.limitacoes) {
        contagem[limitacao] = (contagem[limitacao] || 0) + 1;
      }
    }
    const maior = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];
    return maior ? maior[0] : 'Nenhuma';
  }


  calcularCategoriasComMaisBarreiras(): string {
    const contagem: { [key: string]: number } = {};
    for (const local of this.locaisCadastrados) {
      contagem[local.categoria] = (contagem[local.categoria] || 0) + 1;
    }
    const maior = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];
    return maior ? maior[0] : 'Nenhuma';
  }

  ordenarPorAvaliacao(desc: boolean): void {
    this.locaisCadastrados.sort((a, b) => desc ? b.avaliacao - a.avaliacao : a.avaliacao - b.avaliacao);
  }

  avaliarInformacao(local: any, positiva: boolean): void {
    const mensagem = positiva ? 'Obrigado pelo feedback positivo!' : 'Obrigado pelo seu feedback! Vamos analisar.';
    window.alert(mensagem);
  }

  removerLocal(local: any): void {
    const confirmar = window.confirm('Deseja realmente remover este local?');
    if (confirmar) {
      this.locaisCadastrados = this.locaisCadastrados.filter(item => item !== local);
    }
  }
}
