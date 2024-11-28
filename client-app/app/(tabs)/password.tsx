import React, { useState } from "react";
import { StyleSheet, Text, TextInput, Button, View, Alert } from "react-native";

export default function PassPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [step, setStep] = useState(1); // 1: Input email, 2: Input OTP and new password

  // Gửi yêu cầu quên mật khẩu
  const sendOtp = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }), // Chuyển email thành JSON
        }
      );

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        Alert.alert("Thành công", "Mã OTP đã được gửi tới email của bạn.");
        setOtpToken(data.otpToken);
        setStep(2); // Chuyển sang bước nhập OTP và mật khẩu mới
      } else {
        Alert.alert("Lỗi", data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi kết nối mạng.");
    }
  };

  // Gửi yêu cầu đặt lại mật khẩu
  const resetPassword = async () => {
    if (!otp || !newPassword || !otpToken) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ OTP và mật khẩu mới.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            otp,
            newPassword,
            otpToken,
          }), // Chuyển các thông tin thành JSON
        }
      );

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Thành công", "Mật khẩu của bạn đã được đặt lại.");
        setStep(1); // Quay lại bước nhập email
        setEmail("");
        setOtp("");
        setNewPassword("");
        setOtpToken("");
      } else {
        Alert.alert("Lỗi", data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi kết nối mạng.");
    }
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <View style={styles.form}>
          <Text style={styles.title}>Quên Mật Khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email của bạn"
            value={email}
            onChangeText={setEmail}
          />
          <Button title="Gửi Mã OTP" onPress={sendOtp} />
        </View>
      )}

      {step === 2 && (
        <View style={styles.form}>
          <Text style={styles.title}>Nhập OTP và Mật Khẩu Mới</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Button title="Đặt Lại Mật Khẩu" onPress={resetPassword} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  form: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
});
