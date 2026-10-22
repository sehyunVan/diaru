package sarl.diaru.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

/**
 * 안드로이드 15(targetSdk 35+)부터는 창이 시스템 바 밑까지 깔린다(edge-to-edge).
 * Capacitor 8 은 여백을 따로 넣어 주지 않으므로, 아무것도 안 하면 화면 아래쪽
 * 내비게이션 바가 앱의 하단 메뉴와 **그대로 겹친다.**
 *
 * 이 앱은 세로 한 화면짜리라 내비게이션 바를 띄워 둘 이유가 없다 — 숨긴다.
 * 아래에서 쓸어올리면 잠깐 나왔다가 다시 들어간다(TRANSIENT). 기기의 뒤로가기는
 * 제스처로도 버튼으로도 계속 동작하고, 앱 쪽은 app.js 의 goBack() 이 받는다.
 *
 * 이 파일은 `npx cap add android` 가 덮어쓴다 —
 * tools/native-settings.mjs 가 다시 써 주므로, 고칠 일이 있으면 **거기도 같이** 고친다.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideNavigationBar();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // 다른 앱에 갔다 오면 시스템이 다시 띄워 놓는다 — 돌아올 때마다 다시 숨긴다.
        if (hasFocus) hideNavigationBar();
    }

    private void hideNavigationBar() {
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.hide(WindowInsetsCompat.Type.navigationBars());
    }
}
