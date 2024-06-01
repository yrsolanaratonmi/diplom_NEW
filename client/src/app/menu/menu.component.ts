import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Note, NotesService } from '../notes.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  constructor(
    private readonly router: Router,
    private readonly notesService: NotesService,
    private auth: AuthService
  ) {}

  notes$: Observable<Array<Note>> = this.notesService.notes$;

  private convertTo24HourFormat(dateString) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const hours = date.getHours() + 3;
    const minutes = date.getMinutes();

    const formattedDay = day < 10 ? '0' + day : day;
    const formattedMonth = month < 10 ? '0' + month : month;
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${formattedDay}/${formattedMonth}/${year}, ${formattedHours}:${formattedMinutes}`;
  }

  ngOnInit(): void {
    this.notesService.getNotes().subscribe(
      (res) => this.notesService.notes$.next(res),
      (err) => {
        if (err.status === 405) {
          const time = this.convertTo24HourFormat(err.error.unbanTime);
          alert(`u was blocked by administrator. u will unbanned at ${time}`);
        }
        if (err.status === 401) {
          this.auth.refresh();
        }
      }
    );
  }

  redirectToEdit(noteId: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const params = { openModal: 'true' };
    this.router.navigate([noteId], { queryParams: params });
  }
}
