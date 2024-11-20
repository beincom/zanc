import { Observable } from 'rxjs';
import { ConfigChangeNotification } from './config-change-event.interface';

export interface AppStatesNotifier {
  notify(event: ConfigChangeNotification): Promise<number>;
  changes$: Observable<ConfigChangeNotification>;
  disconnect(): Promise<void>
}
