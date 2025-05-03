import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SobreComponent } from './sobre/sobre.component';
import { LoginComponent } from './login/login.component';
import { MenuSuperiorComponent } from './menu-superior/menu-superior.component';

export const routes: Routes = [
    
    {path: 'home', component: HomeComponent},
    {path: 'sobre', component: SobreComponent},
    {path: 'login', component: LoginComponent},
    {path: 'menu-superior', component: MenuSuperiorComponent},

];
