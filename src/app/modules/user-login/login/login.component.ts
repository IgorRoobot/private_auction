import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/core/services/auth.service';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertService } from '../../../shared/core/services/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  user = [];
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  googleLogin = false;
  defaultLogin = true;

  constructor(
    public db: AngularFirestore, 
    public auth: AuthService, 
    public fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService
  ) { 
    this.auth.user.subscribe(data => {
      this.user.push(data);
    });
  }

  googleActive() {
    this.googleLogin = true;
    this.defaultLogin = false;
  }

  defaultActive() {
    this.googleLogin = false;
    this.defaultLogin = true;
  }
  ngOnInit () {
      this.user = [];
      this.loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });

      //reset login status
      this.auth.logout();

      //get return url from route parameters or default to '/'
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  //convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    //stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    this.auth.login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        }
      );
  }
}