export interface LoginFormElements extends HTMLFormControlsCollection {
    email: HTMLInputElement;
    password: HTMLInputElement;
  }

export interface LoginForm extends HTMLFormElement {
    readonly elements: LoginFormElements;
  }