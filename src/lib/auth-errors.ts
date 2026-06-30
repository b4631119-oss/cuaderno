import { FirebaseError } from "firebase/app";


export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return "Что-то пошло не так. Попробуй ещё раз.";
  }

  switch (error.code) {
    // Вход
    case "auth/invalid-email":
      return "Проверь правильность email.";
    case "auth/user-not-found":
      return "Тетради с таким email не найдено. Может, ещё не регистрировался?";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Неверный пароль. Попробуй ещё раз.";
    case "auth/user-disabled":
      return "Этот аккаунт заблокирован.";
    case "auth/too-many-requests":
      return "Слишком много попыток. Подожди немного и попробуй снова.";

    // Регистрация
    case "auth/email-already-in-use":
      return "Эта тетрадь уже есть — попробуй войти вместо регистрации.";
    case "auth/weak-password":
      return "Пароль слишком простой — нужно минимум 6 символов.";
    case "auth/operation-not-allowed":
      return "Регистрация по email временно недоступна.";

    // Сеть / прочее
    case "auth/network-request-failed":
      return "Нет соединения с интернетом. Проверь сеть.";
    case "auth/internal-error":
      return "Внутренняя ошибка сервера. Попробуй чуть позже.";

    default:
      return "Не получилось. Попробуй ещё раз.";
  }
}