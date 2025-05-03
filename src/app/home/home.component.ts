import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Map, map, tileLayer, Browser, Marker } from 'leaflet';

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

  form = new FormGroup({
    nomeLocal: new FormControl('', Validators.required),
    descricao: new FormControl(''),
    categoria: new FormControl('')
  });

  constructor() {}

  ngOnInit(): void {
    // Futuras configurações podem ir aqui
  }

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
      attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
      maxZoom: 20,
      id: 'osm-bright',
    } as any).addTo(this.leafletMap);

    this.leafletMap.on('click', (e: any) => {
      const { lat, lng } = e.latlng;

      new Marker([lat, lng])
        .addTo(this.leafletMap)
        .bindPopup('Novo local acessível')
        .openPopup();

      console.log('Local adicionado:', lat, lng);
    });
  }
}
