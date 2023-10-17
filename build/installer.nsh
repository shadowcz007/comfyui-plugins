!macro customInstall
   WriteRegStr HKCR "*\shell\MixCopilot" "" "测试........"
   WriteRegStr HKCR "*\shell\MixCopilot" "Icon" "$INSTDIR\MixCopilot.exe"
   WriteRegStr HKCR "*\shell\MixCopilot\command" "" '"$INSTDIR\MixCopilot.exe" "read" "%1"'
!macroend
;卸载时清除
!macro customUninstall
   DeleteRegKey HKCR "*\shell\MixCopilot"
!macroend