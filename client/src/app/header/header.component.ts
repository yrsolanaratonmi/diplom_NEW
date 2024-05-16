import { Component, Inject, Injector } from '@angular/core';
import { NotesService } from '../notes.service';
import { TuiDialogService } from '@taiga-ui/core';
import { AuthComponent } from '../auth/auth.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { AuthService } from '../auth.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isUserLoggedIn$ = this.authService.isUserLoggedIn$;
  constructor(
    private readonly notesService: NotesService,
    @Inject(TuiDialogService) private readonly dialog: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly authService: AuthService
  ) {}

  darkMode = this.notesService.isDarkMode$;
  changeMode() {
    this.notesService.isDarkMode$ = !this.notesService.isDarkMode$.value;
  }

  openLoginForm() {
    this.dialog
      .open(new PolymorpheusComponent(AuthComponent, this.injector), {
        size: 'l',
      })
      .subscribe();
  }

  logout() {
    this.authService.logout();
  }

  getAcl() {
    this.authService.acl().subscribe(
      (res: any) => {
        console.log(res);
        const code = this.decode(res);
        alert(code);
      },
      (res: any) => {
        console.log(res.error.text);
        const code = this.decode(res.error.text);
        alert(code);
      }
    );
  }

  private decode(content: string) {
    const keyContent = localStorage.getItem('key') as string;

    return CryptoJS.AES.decrypt(content, keyContent).toString(
      CryptoJS.enc.Utf8
    );
  }
}
