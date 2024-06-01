import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { bufferCount, startWith } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.scss'],
})
export class UserItemComponent {
  @Input() user!: { login: string; bantime: string };

  tools = new FormGroup({
    hour: new FormControl(false),
    day: new FormControl(false),
    forever: new FormControl(false),
  });

  constructor(private readonly auth: AuthService) {}

  ngOnInit(): void {
    console.log(this.user);

    if (+this.user.bantime !== 0) {
      const time = new Date(+this.user.bantime).getTime();
      const timeMap = {
        hour: 1000 * 60 * 60,
        day: 1000 * 60 * 60 * 24,
      };
      const diff = time - Date.now();
      if (diff < timeMap.hour) {
        this.tools.controls.hour.patchValue(true);
      }
      if (diff > timeMap.hour && diff < timeMap.day) {
        this.tools.controls.day.patchValue(true);
      }
      if (diff > timeMap.day) {
        this.tools.controls.forever.patchValue(true);
      }
    }

    this.tools.valueChanges
      .pipe(
        startWith({
          hour: this.tools.controls.hour.value,
          day: this.tools.controls.day.value,
          forever: this.tools.controls.forever.value,
        }),
        bufferCount(2, 1)
      )
      .subscribe(([prev, curr]) => {
        let changed: any;

        for (const key in prev as any) {
          if ((prev as any)[key] !== (curr as any)[key]) changed = key;
        }

        const val = (curr as any)[changed as any];

        this.tools.patchValue(
          { hour: false, day: false, forever: false },
          { emitEvent: false }
        );

        if (changed) {
          this.tools.controls[changed].patchValue(val, { emitEvent: false });
        } else return;

        const info = {
          hour: 1000 * 60 * 60,
          day: 1000 * 60 * 60 * 24,
        };

        const time = info[changed] || new Date('2099-01-01').getTime();
        this.auth.ban(this.user.login, time, !val).subscribe(console.log);
      });
  }
}
