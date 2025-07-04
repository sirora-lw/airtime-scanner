import { Component } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { createWorker } from 'tesseract.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  pin: string | null = null;
  loading = false;

  constructor() {}

  async captureImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.Uri,
    });

    if (image && image.webPath) {
      this.loading = true;
      const worker = createWorker();
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data } = await worker.recognize(image.webPath);
      await worker.terminate();
      this.loading = false;

      this.pin = this.extractPin(data.text);
      if (!this.pin) {
        alert('Could not detect a valid PIN. Please try again.');
      }
    }
  }

  extractPin(text: string): string | null {
    const matches = text.match(/\d{10,16}/g);
    return matches ? matches[0] : null;
  }

  dialUssd() {
    if (!this.pin) {
      alert('No PIN available');
      return;
    }
    const ussdCode = `*123*${this.pin}#`;
    const encoded = encodeURIComponent(ussdCode);
    window.open(`tel:${encoded}`, '_system');
  }
}
