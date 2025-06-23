<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);

        Auth::login($user, true); // Включаем "Запомнить меня"

        return response()->json(['message' => 'Пользователь зарегистрирован', 'user' => $user], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Неверные данные для входа.'],
            ]);
        }

        Auth::login($user, true); // Включаем "Запомнить меня"

        return response()->json(['message' => 'Вход выполнен', 'user' => $user]);
    }

    public function logout(Request $request)
    {
        Auth::logout(); // Завершаем сессию
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Выход выполнен']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}