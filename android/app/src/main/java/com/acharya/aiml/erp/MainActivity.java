package com.acharya.aiml.erp;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import androidx.core.view.WindowCompat;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ErpNotificationsPlugin.class);
        super.onCreate(savedInstanceState);

        // Keep app content inside system bars; XML uses fitsSystemWindows on root and WebView.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }

    @Override
    public void onBackPressed() {
        if (getBridge().getWebView().canGoBack()) {
            getBridge().getWebView().goBack();
        } else {
            super.onBackPressed();
        }
    }
}
