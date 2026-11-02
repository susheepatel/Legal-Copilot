package in.legalcopilot.app;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private WebView mWebView;
    private SwipeRefreshLayout mSwipeRefresh;
    private static final String DEV_SERVER_URL = "http://10.0.2.2:3000";
    private static final String ASSET_BUNDLE_URL = "file:///android_asset/public/index.html";
    private static final String SUPABASE_PROJECT_URL = "https://fgcmspgfxdieljbhliuq.supabase.co";

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Make window background matching Dark Slate 950
        getWindow().setStatusBarColor(Color.parseColor("#020617"));
        getWindow().setNavigationBarColor(Color.parseColor("#020617"));

        // Initialize layout programmatically to avoid xml inflation bottlenecks
        mSwipeRefresh = new SwipeRefreshLayout(this);
        mSwipeRefresh.setProgressBackgroundColorSchemeColor(Color.parseColor("#0f172a"));
        mSwipeRefresh.setColorSchemeColors(Color.parseColor("#6366f1"), Color.parseColor("#10b981"));

        mWebView = new WebView(this);
        mWebView.setBackgroundColor(Color.parseColor("#020617"));
        mSwipeRefresh.addView(mWebView);
        setContentView(mSwipeRefresh);

        // Configure WebSettings for high performance and offline storage
        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(false);
        }

        // Add Native JavaScript Bridges
        mWebView.addJavascriptInterface(new WebAppInterface(this), "AndroidBridge");
        mWebView.addJavascriptInterface(new LegalDatabaseSyncBridge(this, SUPABASE_PROJECT_URL), "SupabaseBridge");

        // Setup WebViewClient with fallback handling
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                mSwipeRefresh.setRefreshing(false);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    // If dev server fails, fallback to bundled offline assets
                    if (!view.getUrl().startsWith("file:///")) {
                        view.loadUrl(ASSET_BUNDLE_URL);
                    }
                }
            }
        });

        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage cm) {
                return true;
            }
        });

        // Pull to refresh
        mSwipeRefresh.setOnRefreshListener(() -> {
            mWebView.reload();
        });

        // Initial Load
        loadApp();
    }

    private void loadApp() {
        if (isNetworkAvailable()) {
            // Check if dev server is reachable or load bundle
            mWebView.loadUrl(DEV_SERVER_URL);
        } else {
            mWebView.loadUrl(ASSET_BUNDLE_URL);
            Toast.makeText(this, "Operating in Offline Chamber Vault mode", Toast.LENGTH_SHORT).show();
        }
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm != null) {
            NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
            return activeNetwork != null && activeNetwork.isConnected();
        }
        return false;
    }

    @Override
    public void onBackPressed() {
        if (mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}

