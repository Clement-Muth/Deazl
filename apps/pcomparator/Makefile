install:
	@yarn install
.PHONY: install

ci: up format lint analyze test
.PHONY: ci

up:
	$(MAKE) install
	@printf "💄 Please wait, starting pcomparator...\n\n"
	@traefik &
	$(MAKE) start
	@printf "\n\Pcomparator is ready, enjoy 🎉\nRun make logs if you want some 💡\n\n"
.PHONY: up

start:
	@yarn run dev
.PHONY: start

down:
	$(MAKE) -C .. down
.PHONY: up

lint: | up
	@yarn run lint:check
.PHONY: lint

analyze: | up
	@yarn run typescript:check
.PHONY: analyze

test: PATHS?=.
test: | up
	@yarn run test ${PATHS}
.PHONY: test

ifeq ($(CI),)
certs:
	mkcert -uninstall
	sudo rm -rf /etc/ssl/certs/mkcert*
	mkdir -p certs/root
	mkcert -cert-file certs/cert.pem -key-file certs/key.pem "pcomparator.localhost" "bore.pub"
	mkcert -install
else
certs:
endif

# ============================================
# Mobile Development Commands (Capacitor)
# ============================================

# Show current local IP for mobile development
mobile-ip:
	@echo "📱 Your local IP address:"
	@node -e "const os = require('os'); const interfaces = os.networkInterfaces(); for (const name of Object.keys(interfaces)) { for (const iface of interfaces[name]) { if (iface.family === 'IPv4' && !iface.internal) { console.log('   ' + iface.address); } } }"
	@echo ""
	@echo "💡 Use this IP in capacitor.config.ts for development"
.PHONY: mobile-ip

# Start development server with QR code for mobile testing
mobile-dev:
	@yarn run mobile:dev
.PHONY: mobile-dev

# Sync all platforms
cap-sync:
	@yarn run cap:sync
.PHONY: cap-sync

# ============================================
# Android Commands
# ============================================

# Open Android Studio
android:
	@yarn run android
.PHONY: android

# Sync Android platform
android-sync:
	@yarn run android:sync
.PHONY: android-sync

# Run on connected Android device
android-run:
	@yarn run android:run
.PHONY: android-run

# Build for Android (debug)
android-build:
	@yarn run android:build
.PHONY: android-build

# Build Android APK (debug)
android-apk:
	@yarn run android:build:debug
	@echo ""
	@echo "✅ APK built successfully!"
	@echo "📍 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
.PHONY: android-apk

# Build Android APK (release)
android-release:
	@yarn run android:build:release
	@echo ""
	@echo "✅ Release APK built successfully!"
	@echo "📍 APK location: android/app/build/outputs/apk/release/app-release-unsigned.apk"
.PHONY: android-release

# ============================================
# iOS Commands
# ============================================

# Open Xcode
ios:
	@yarn run ios
.PHONY: ios

# Sync iOS platform
ios-sync:
	@yarn run ios:sync
.PHONY: ios-sync

# Run on connected iOS device or simulator
ios-run:
	@yarn run ios:run
.PHONY: ios-run

# Build for iOS
ios-build:
	@yarn run ios:build
.PHONY: ios-build

# Install CocoaPods dependencies
ios-pods:
	@cd ios/App && pod install
.PHONY: ios-pods
