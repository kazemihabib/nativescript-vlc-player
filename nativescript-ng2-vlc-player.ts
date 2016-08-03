// for standard export at bottom
import {VLCComponent} from './src/app/components/vlc.component';

// for manual imports
export * from  './src/app/components/vlc.component';

// provides standard for consumption via things like angular-cli
export default {
  directives: [VLCComponent],
}
