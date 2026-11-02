package in.legalcopilot.app;

import android.content.Context;
import android.os.Vibrator;
import android.os.VibrationEffect;
import android.os.Build;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

/**
 * Native Android JavaScript Bridge for device hardware integrations.
 */
public class WebAppInterface {
    private final Context mContext;

    public WebAppInterface(Context c) {
        this.mContext = c;
    }

    @JavascriptInterface
    public void showToast(String message) {
        Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public void vibrateDevice(long durationMs) {
        Vibrator v = (Vibrator) mContext.getSystemService(Context.VIBRATOR_SERVICE);
        if (v != null && v.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                v.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                v.vibrate(durationMs);
            }
        }
    }

    @JavascriptInterface
    public String getPlatformName() {
        return "Android Native Container (v2.1.0)";
    }
}
