using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using TheRoutineWeb.Data;
using TheRoutineWeb.Models;

namespace TheRoutineWeb
{
    public class WorkoutSessionExercisesController : Controller
    {
        private readonly AppDbContext _context;

        public WorkoutSessionExercisesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: WorkoutSessionExercises
        public async Task<IActionResult> Index()
        {
            var appDbContext = _context.WorkoutSessionExercises.Include(w => w.WorkoutSession);
            return View(await appDbContext.ToListAsync());
        }

        // GET: WorkoutSessionExercises/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var workoutSessionExercise = await _context.WorkoutSessionExercises
                .Include(w => w.WorkoutSession)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (workoutSessionExercise == null)
            {
                return NotFound();
            }

            return View(workoutSessionExercise);
        }

        // GET: WorkoutSessionExercises/Create
        public IActionResult Create()
        {
            ViewData["WorkoutSessionId"] = new SelectList(_context.WorkoutSessions, "Id", "Id");
            return View();
        }

        // POST: WorkoutSessionExercises/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,WorkoutSessionId,Name,Muscles,Order,Weight,IsOptional")] WorkoutSessionExercise workoutSessionExercise)
        {
            if (ModelState.IsValid)
            {
                _context.Add(workoutSessionExercise);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["WorkoutSessionId"] = new SelectList(_context.WorkoutSessions, "Id", "Id", workoutSessionExercise.WorkoutSessionId);
            return View(workoutSessionExercise);
        }

        // GET: WorkoutSessionExercises/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var workoutSessionExercise = await _context.WorkoutSessionExercises.FindAsync(id);
            if (workoutSessionExercise == null)
            {
                return NotFound();
            }
            ViewData["WorkoutSessionId"] = new SelectList(_context.WorkoutSessions, "Id", "Id", workoutSessionExercise.WorkoutSessionId);
            return View(workoutSessionExercise);
        }

        // POST: WorkoutSessionExercises/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,WorkoutSessionId,Name,Muscles,Order,Weight,IsOptional")] WorkoutSessionExercise workoutSessionExercise)
        {
            if (id != workoutSessionExercise.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(workoutSessionExercise);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!WorkoutSessionExerciseExists(workoutSessionExercise.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            ViewData["WorkoutSessionId"] = new SelectList(_context.WorkoutSessions, "Id", "Id", workoutSessionExercise.WorkoutSessionId);
            return View(workoutSessionExercise);
        }

        // GET: WorkoutSessionExercises/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var workoutSessionExercise = await _context.WorkoutSessionExercises
                .Include(w => w.WorkoutSession)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (workoutSessionExercise == null)
            {
                return NotFound();
            }

            return View(workoutSessionExercise);
        }

        // POST: WorkoutSessionExercises/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var workoutSessionExercise = await _context.WorkoutSessionExercises.FindAsync(id);
            if (workoutSessionExercise != null)
            {
                _context.WorkoutSessionExercises.Remove(workoutSessionExercise);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool WorkoutSessionExerciseExists(int id)
        {
            return _context.WorkoutSessionExercises.Any(e => e.Id == id);
        }
    }
}
