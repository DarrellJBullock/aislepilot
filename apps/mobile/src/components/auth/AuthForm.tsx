import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
// See src/app/shopping/[listId].tsx for why ScrollView comes from
// react-native-gesture-handler, not react-native, in this app.
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from "@aislepilot/validation";
import { useApp } from "../../store/context";
import { Logo } from "../Logo";
import { Button, Input, Label, FieldError, Card, CardBody } from "../ui";

type FormValues = SignUpInput;

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { signIn, signUp } = useApp();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const isSignUp = mode === "sign-up";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(isSignUp ? signUpSchema : (signInSchema as unknown as typeof signUpSchema)),
    defaultValues: { email: "", password: "", displayName: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    const err = await Promise.resolve(
      isSignUp
        ? signUp(values.email, values.password, values.displayName)
        : signIn((values as SignInInput).email, values.password),
    );
    if (err) {
      setFormError(err);
      return;
    }
    router.replace("/(tabs)/home");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#f7f8fa]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-5 py-10">
        <View className="mb-8 items-center">
          <Logo />
        </View>
        <Card>
          <CardBody className="gap-4">
            <Text className="text-2xl font-bold text-ink">
              {isSignUp ? "Create your account" : "Welcome back"}
            </Text>
            <Text className="-mt-2 text-sm text-ink-muted">
              {isSignUp
                ? "Start building smarter shopping lists."
                : "Sign in to pick up where you left off."}
            </Text>

            {isSignUp && (
              <View>
                <Label>Name</Label>
                <Controller
                  control={control}
                  name="displayName"
                  render={({ field }) => (
                    <Input
                      autoComplete="name"
                      placeholder="Alex Shopper"
                      value={field.value ?? ""}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </View>
            )}
            <View>
              <Label>Email</Label>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    autoComplete="email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="you@example.com"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </View>
            <View>
              <Label>Password</Label>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input
                    secureTextEntry
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    placeholder="••••••••"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </View>

            {formError && (
              <View accessibilityRole="alert" className="rounded-lg bg-red-50 px-3 py-2.5">
                <Text className="text-sm text-red-700">{formError}</Text>
              </View>
            )}

            <Button size="lg" fullWidth disabled={isSubmitting} onPress={handleSubmit(onSubmit)}>
              {isSignUp ? "Create account" : "Sign in"}
            </Button>
          </CardBody>
        </Card>

        <View className="mt-6 flex-row justify-center gap-1">
          <Text className="text-sm text-ink-muted">
            {isSignUp ? "Already have an account?" : "New to AislePilot?"}
          </Text>
          <Text
            className="text-sm font-semibold text-brand-700"
            onPress={() => router.push(isSignUp ? "/sign-in" : "/sign-up")}
          >
            {isSignUp ? "Sign in" : "Create one"}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
