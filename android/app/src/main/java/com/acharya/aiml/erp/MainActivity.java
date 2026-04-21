package com.acharya.aiml.erp;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        final View webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            final int basePaddingLeft = webView.getPaddingLeft();
            final int basePaddingTop = webView.getPaddingTop();
            final int basePaddingRight = webView.getPaddingRight();
            final int basePaddingBottom = webView.getPaddingBottom();

            ViewCompat.setOnApplyWindowInsetsListener(webView, (view, insets) -> {
                Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                view.setPadding(
                    basePaddingLeft + systemBars.left,
                    basePaddingTop + systemBars.top,
                    basePaddingRight + systemBars.right,
                    basePaddingBottom + systemBars.bottom
                );
                return insets;
            });
            ViewCompat.requestApplyInsets(webView);
        }
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
