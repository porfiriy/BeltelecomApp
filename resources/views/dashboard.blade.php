<!DOCTYPE html>
<html lang="ru">

<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Панель управления</title>
   <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>

<body class="bg-gray-100">
   <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Панель управления</h1>

      <div class="bg-white p-6 rounded-lg shadow-md">
         <h2 class="text-xl font-semibold mb-4">Последние действия</h2>
         @if($recentActivities->isEmpty())
          <p class="text-gray-500">Нет недавних действий.</p>
       @else
          <ul class="space-y-4">
            @foreach($recentActivities as $activity)
            <li class="border-b pb-2">
               <p><strong>Сотрудник:</strong> {{ $activity->user->name ?? 'Неизвестный пользователь' }}</p>
               <p><strong>Действие:</strong> {{ $activity->action_type }}</p>
               <p><strong>Описание:</strong> {{ $activity->description }}</p>
               <p><strong>Дата:</strong> {{ $activity->created_at->format('d.m.Y H:i') }}</p>
            </li>
          @endforeach
          </ul>
       @endif
      </div>
   </div>
</body>

</html>