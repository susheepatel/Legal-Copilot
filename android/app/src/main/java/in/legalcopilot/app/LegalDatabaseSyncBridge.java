package in.legalcopilot.app;

import android.content.Context;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

/**
 * JavaScript interface to synchronize mobile app data with Supabase Cloud Database.
 */
public class LegalDatabaseSyncBridge {

    private final Context mContext;
    private final String mSupabaseUrl;

    public LegalDatabaseSyncBridge(Context context, String supabaseUrl) {
        this.mContext = context;
        this.mSupabaseUrl = supabaseUrl;
    }

    @JavascriptInterface
    public String getSupabaseUrl() {
        return mSupabaseUrl;
    }

    @JavascriptInterface
    public void notifySyncSuccess(int casesCount, int clientsCount) {
        String msg = "Synced " + casesCount + " cases and " + clientsCount + " clients with Supabase Cloud!";
        Toast.makeText(mContext, msg, Toast.LENGTH_LONG).show();
    }

    @JavascriptInterface
    public void notifySyncError(String errorMessage) {
        Toast.makeText(mContext, "Database sync failed: " + errorMessage, Toast.LENGTH_LONG).show();
    }
}

