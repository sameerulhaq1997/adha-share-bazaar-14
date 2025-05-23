
// Configuration service for application-wide settings
class ConfigService {
  private static instance: ConfigService;
  private showProductImages: boolean = false;

  private constructor() {
    // Initialize with stored preference from localStorage if available
    const storedPreference = localStorage.getItem('showProductImages');
    if (storedPreference !== null) {
      this.showProductImages = storedPreference === 'true';
    }
  }

  // Singleton pattern
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  // Get current setting for product images
  getShowProductImages(): boolean {
    return this.showProductImages;
  }

  // Toggle or set product images visibility
  setShowProductImages(show: boolean): void {
    this.showProductImages = show;
    localStorage.setItem('showProductImages', String(show));
    // Dispatch a custom event to notify components of the change
    window.dispatchEvent(new CustomEvent('product-images-setting-changed', {
      detail: { showProductImages: show }
    }));
  }
}

export const configService = ConfigService.getInstance();
