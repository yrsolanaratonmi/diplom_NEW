import { Component } from '@angular/core';
import { NotesService } from '../notes.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  constructor(private auth: AuthService) {}

  users$ = this.auth.admin();
}
