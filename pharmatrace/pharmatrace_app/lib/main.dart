import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'theme/app_theme.dart';
import 'screens/intro_screen.dart';
import 'screens/home_screen.dart';
import 'utils/web3_service.dart';

final Web3Service web3Service = Web3Service();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(const PharmaTraceApp());
}

class PharmaTraceApp extends StatelessWidget {
  const PharmaTraceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PharmaTrace',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      home: const IntroScreen(),
    );
  }
}
