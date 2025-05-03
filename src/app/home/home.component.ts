import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Map, map, tileLayer, Browser, Icon, Marker } from 'leaflet';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLElement>;
  private leafletMap!: Map;

  mostrarFormulario = false;
  private marcadorSelecionado!: Marker;

  form = new FormGroup({
    nomeLocal: new FormControl('', Validators.required),
    categoria: new FormControl('', Validators.required),
    limitacoes: new FormControl('', Validators.required)
  });

  categorias: string[] = ['Loja', 'Mercado', 'Praça', 'Restaurante', 'Escola'];
  limitacoes: string[] = ['Rampa', 'Elevador', 'Piso tátil', 'Banheiro adaptado'];

  locaisCadastrados: any[] = [];

  // Novo ícone 📌
  iconeLocal = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // estilo 📌
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  constructor() {}

  ngOnInit(): void {}

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

      // Remove marcador anterior, se existir
      if (this.marcadorSelecionado) {
        this.leafletMap.removeLayer(this.marcadorSelecionado);
      }

      // Adiciona novo marcador com ícone 📌
      this.marcadorSelecionado = new Marker([lat, lng], {
        icon: this.iconeLocal
      }).addTo(this.leafletMap)
        .bindPopup('Local selecionado')
        .openPopup();

      // Evento para remover marcador ao fechar o popup
      this.marcadorSelecionado.on('popupclose', () => {
        this.leafletMap.removeLayer(this.marcadorSelecionado);
        this.mostrarFormulario = false;
      });

      // Exibe formulário
      this.mostrarFormulario = true;
      this.form.reset();
    });
  }

  salvarLocal(): void {
    if (this.form.valid) {
      const confirmar = window.confirm('Deseja realmente salvar este local?');

      if (confirmar) {
        this.locaisCadastrados.push({ ...this.form.value });
        this.form.reset();
        this.mostrarFormulario = false;

        // Remove o marcador também
        if (this.marcadorSelecionado) {
          this.leafletMap.removeLayer(this.marcadorSelecionado);
        }
      }
    }
  }
}
