import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

const THEME_STORAGE_KEY = 'wave-relate-theme';
const SIDEBAR_STORAGE_KEY = 'wave-relate-sidebar-collapsed';

@Component({
  selector: 'app-root',
  imports: [RouterModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  isDarkMode = false;
  sidebarCollapsed = false;

  constructor(private readonly router: Router) {}

  ngOnInit() {
    this.isDarkMode = localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
    this.applyTheme();
    this.sidebarCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem(THEME_STORAGE_KEY, this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(this.sidebarCollapsed));
  }

  goHome() {
    this.router.navigate(['/persons']);
  }

  private applyTheme() {
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }
}
