import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/internal/operators/map';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, catchError, takeUntil } from 'rxjs';
import { Note, NotesService } from '../notes.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-note-new',
  templateUrl: './note-new.component.html',
  styleUrls: ['./note-new.component.scss'],
})
export class NoteNewComponent implements OnDestroy {
  notes$: Observable<Array<Note>> = this.notesService.getNotes();

  private readonly destroy$ = new Subject();
  file!: File | null;

  noteData: FormGroup<{
    title: FormControl<string>;
    description: FormControl<string>;
    fileData: FormControl<null>;
  }> = new FormGroup({
    title: new FormControl('', Validators.required) as FormControl<string>,
    description: new FormControl(
      '',
      Validators.required
    ) as FormControl<string>,
    fileData: new FormControl(null),
  });

  constructor(
    private readonly router: Router,
    private notesService: NotesService,
    private auth: AuthService
  ) {}

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
  saveNew() {
    const data: Partial<Note> = {
      title: this.noteData.controls.title.value as string,
      description: this.noteData.controls.description.value as string,
      fileData: this.noteData.controls.fileData.value,
    };
    data.file = this.file;

    this.notesService.addNote(data).subscribe(
      (note: Note) => {
        this.router.navigate([note.id]);
        this.notesService.getNotes().subscribe(
          (res) => this.notesService.notes$.next(res),
          (err) => {
            if (err.status === 405) {
              const time = this.convertTo24HourFormat(err.error.unbanTime);
              alert(
                `u was blocked by administrator. u will unbanned at ${time}`
              );
            }
          }
        );
      },
      (err) => {
        if (err.status === 401) {
          this.auth.refresh();
        }
        if (err.status === 405) {
          const time = this.convertTo24HourFormat(err.error.unbanTime);
          alert(`u was blocked by administrator. u will unbanned at ${time}`);
        }
      }
    );
  }

  onFileChange() {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent) => {
      this.file = (event.target as any).result;
    };

    reader.readAsDataURL(this.noteData.controls.fileData.value as any);
  }

  removeFile() {
    this.noteData.controls.fileData.setValue(null);
    this.file = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
