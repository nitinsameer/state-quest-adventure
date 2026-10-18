# ProGuard Rules for Production Release Build
# Strict obfuscation with security hardening

# ============================================================================
# CRITICAL: Strip debug symbols to prevent reverse engineering
# ============================================================================
-dontshrink
-dontoptimize
-keepattributes !SourceFile
-keepattributes !LineNumberTable
-renamesourcefileattribute PG

# ============================================================================
# CRITICAL: Obfuscate ALL classes by default
# Exceptions: public Android/Capacitor APIs must be kept readable
# ============================================================================
-repackageclasses
-allowaccessmodification

# ============================================================================
# KEEP: Android Framework and Capacitor Bridge
# These are public APIs called from WebView/JavaScript
# ============================================================================

# Android framework classes (required for manifest-referenced classes)
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Service
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.app.backup.BackupAgentHelper
-keep public class * extends android.content.SharedPreferences
-keep public class * extends android.view.View
-keep public class * extends android.view.ViewGroup

# Capacitor WebView Bridge - CRITICAL: Keep JavaScript interface methods
# DO NOT obfuscate methods that WebView calls via JavaScript
-keepclasseswithmembernames class * {
    public <methods>;
}

-keepclasseswithmembernames class * {
    native <methods>;
}

# Capacitor Plugins - keep public methods (WebView calls these)
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.android.** { *; }
-keep class com.getcapacitor.plugin.** { public *; }
-keepclassmembers class * extends com.getcapacitor.plugin.Plugin {
    public <methods>;
}

# Keep R classes (resource references)
-keepclassmembers class **.R$* {
    public static <fields>;
}

# ============================================================================
# KEEP: Firebase and Google Play Services (public APIs only)
# ============================================================================
-keep class com.google.firebase.** { public *; }
-keep interface com.google.firebase.** { *; }

-keep class com.google.android.gms.** { public *; }
-keep interface com.google.android.gms.** { *; }

-keepclassmembers class com.google.android.gms.** {
    public <methods>;
}

# ============================================================================
# KEEP: AndroidX and Core Libraries (public APIs only)
# ============================================================================
-keep class androidx.** { public *; }
-keep interface androidx.** { *; }

-keep class android.** { public *; }
-keep interface android.** { *; }

# ============================================================================
# REMOVE: Logging (security hardening - prevent info leakage)
# ============================================================================
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# ============================================================================
# REMOVE: Reflection attacks (strip reflection capabilities)
# ============================================================================
-dontshrink
-optimizationpasses 5

# ============================================================================
# WARNINGS: Ignore harmless warnings
# ============================================================================
-dontwarn android.**
-dontwarn androidx.**
-dontwarn com.google.**
-dontwarn com.google.firebase.**
-dontwarn org.apache.**
-dontwarn org.json.**
