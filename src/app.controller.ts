import { Get, Controller, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/signin')
  @Render('pages/signin')
  async signinForm() {
    return { title: 'Sign in' };
  }

  @Get('/signup')
  @Render('pages/signup')
  async signupForm() {
    return { title: 'Sign up' };
  }

  @Get('/chat')
  @Render('pages/chat')
  async chatForm() {
    return { title: 'Chat app' };
  }
}
