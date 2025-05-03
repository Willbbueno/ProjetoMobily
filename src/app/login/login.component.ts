import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',  
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule] 
})
export class LoginComponent implements OnInit {
  formUsuario: FormGroup;

  constructor(private fb: FormBuilder) {
    // Inicialização do formulário com os campos necessários
    this.formUsuario = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required],
      telefone: [''],
      dataNascimento: [''],
      tipoDeficiencia: [''],
      tipoUsuario: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  salvarCadastro(): void {
    // Verifica se o formulário é válido
    if (this.formUsuario.valid) {
      console.log(this.formUsuario.value);  // Salvar o cadastro, recurso será implementado até a AF.
      // Lógica para salvar o cadastro no backend ou localmente
    } else {
      alert('Preencha todos os campos obrigatórios corretamente!');
    }
  }
}
